import React, { useState } from 'react';
import {
  AgentStatusValue,
  AnalysisRunState,
  AnalystKey,
  InstrumentSnapshot,
  PortfolioContextState,
  RunConfig,
} from '../types/trading';
import {
  getOrBuildInstrumentSnapshot,
  getTodayDateStr,
  PROVIDER_CATALOG,
} from '../data/presets';
import { UI_TEXT, UILanguage } from '../utils/i18n';
import { MarkdownBlock } from './MarkdownBlock';
import {
  Play,
  RotateCcw,
  Check,
  Clock,
  AlertCircle,
  Terminal,
  Sliders,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface AnalysisDeskViewProps {
  lang: UILanguage;
  ticker: string;
  setTicker: (t: string) => void;
  tradeDate: string;
  setTradeDate: (d: string) => void;
  selectedAnalysts: AnalystKey[];
  setSelectedAnalysts: (a: AnalystKey[]) => void;
  config: RunConfig;
  setConfig: React.Dispatch<React.SetStateAction<RunConfig>>;
  portfolio: PortfolioContextState;
  runState: AnalysisRunState;
  agentStatuses: Record<string, AgentStatusValue>;
  isRunning: boolean;
  activeStageText: string;
  onRunAnalysis: () => void;
  onOpenReport: () => void;
  onResetCheckpoints: () => void;
  checkpointClearedCount: number;
  liveSnapshot?: InstrumentSnapshot | null;
  isFetchingLive: boolean;
  onFetchLiveSnapshot: () => void;
}

const QUICK_TICKERS = ['NVDA', 'AAPL', '0700.HK', 'BTC-USD'];

export const AnalysisDeskView: React.FC<AnalysisDeskViewProps> = ({
  lang,
  ticker,
  setTicker,
  tradeDate,
  setTradeDate,
  selectedAnalysts,
  setSelectedAnalysts,
  config,
  setConfig,
  portfolio,
  runState,
  agentStatuses,
  isRunning,
  activeStageText,
  onRunAnalysis,
  onOpenReport,
  onResetCheckpoints,
  checkpointClearedCount,
  liveSnapshot,
  isFetchingLive,
  onFetchLiveSnapshot,
}) => {
  const t = UI_TEXT[lang].desk;

  const [activeReportTab, setActiveReportTab] = useState<
    | 'pm'
    | 'trader'
    | 'research'
    | 'risk'
    | 'market'
    | 'social'
    | 'news'
    | 'fundamentals'
  >('pm');
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const fallbackSnapshot = getOrBuildInstrumentSnapshot(ticker);
  const snapshot =
    liveSnapshot && liveSnapshot.ticker.toUpperCase() === ticker.trim().toUpperCase()
      ? liveSnapshot
      : fallbackSnapshot;

  const analystOptions: { key: AnalystKey; label: string; rawName: string }[] = [
    { key: 'market', label: t.analysts.market, rawName: 'Market Analyst' },
    { key: 'social', label: t.analysts.social, rawName: 'Sentiment Analyst' },
    { key: 'news', label: t.analysts.news, rawName: 'News Analyst' },
    { key: 'fundamentals', label: t.analysts.fundamentals, rawName: 'Fundamentals Analyst' },
  ];

  const toggleAnalyst = (key: AnalystKey) => {
    if (selectedAnalysts.includes(key)) {
      if (selectedAnalysts.length > 1) {
        setSelectedAnalysts(selectedAnalysts.filter((k) => k !== key));
      }
    } else {
      setSelectedAnalysts([...selectedAnalysts, key]);
    }
  };

  const todayStr = getTodayDateStr();

  const handleDateChange = (val: string) => {
    setTradeDate(val);
    if (val > todayStr) {
      setDateError(
        lang === 'zh-TW'
          ? `分析基準日不可晚於今日 (${todayStr})`
          : `trade_date cannot be in the future (max ${todayStr})`
      );
    } else {
      setDateError(null);
    }
  };

  const providerModels = PROVIDER_CATALOG[config.llm_provider] || PROVIDER_CATALOG.google;

  const teams = [
    {
      name: t.pipeline.team1,
      agents: analystOptions
        .filter((a) => selectedAnalysts.includes(a.key))
        .map((a) => ({
          name: a.rawName,
          displayLabel: a.label,
          key: a.key,
          wallTime: runState.analyst_wall_times[a.key],
        })),
    },
    {
      name: t.pipeline.team2,
      agents: [
        { name: 'Bull Researcher', displayLabel: lang === 'zh-TW' ? '看多研究員 (Bull Researcher)' : 'Bull Researcher' },
        { name: 'Bear Researcher', displayLabel: lang === 'zh-TW' ? '看空研究員 (Bear Researcher)' : 'Bear Researcher' },
        { name: 'Research Manager', displayLabel: lang === 'zh-TW' ? '研究總監 (Research Manager)' : 'Research Manager' },
      ],
    },
    {
      name: t.pipeline.team3,
      agents: [{ name: 'Trader', displayLabel: lang === 'zh-TW' ? '交易員 (Trader)' : 'Trader' }],
    },
    {
      name: t.pipeline.team4,
      agents: [
        { name: 'Aggressive Analyst', displayLabel: lang === 'zh-TW' ? '積極派風控分析師' : 'Aggressive Analyst' },
        { name: 'Neutral Analyst', displayLabel: lang === 'zh-TW' ? '中立派風控分析師' : 'Neutral Analyst' },
        { name: 'Conservative Analyst', displayLabel: lang === 'zh-TW' ? '保守派風控分析師' : 'Conservative Analyst' },
      ],
    },
    {
      name: t.pipeline.team5,
      agents: [
        { name: 'Portfolio Manager', displayLabel: lang === 'zh-TW' ? '投資組合經理 (Portfolio Manager)' : 'Portfolio Manager' },
      ],
    },
  ];

  const completedCount = Object.values(agentStatuses).filter((s) => s === 'completed').length;
  const totalAgents = Object.keys(agentStatuses).length;

  const getReportContent = () => {
    switch (activeReportTab) {
      case 'market':
        return {
          title:
            lang === 'zh-TW'
              ? '市場技術分析師 — 價量結構與技術指標報告'
              : 'Market Analyst — Technical & Price Structure',
          content: runState.market_report,
        };
      case 'social':
        return {
          title:
            lang === 'zh-TW'
              ? '社群情緒分析師 — StockTwits、Reddit 與 Jev 過濾報告'
              : 'Sentiment Analyst — Social & News Band',
          content: runState.sentiment_report,
        };
      case 'news':
        return {
          title:
            lang === 'zh-TW'
              ? '宏觀新聞分析師 — 全球總經、FRED 殖利率與 Polymarket 預測市場'
              : 'News Analyst — Global Macro, FRED & Polymarket',
          content: runState.news_report,
        };
      case 'fundamentals':
        return {
          title:
            lang === 'zh-TW'
              ? '基本面財報分析師 — SEC EDGAR 原始申報 (As-Filed) 財務報表'
              : 'Fundamentals Analyst — SEC EDGAR As-Filed Statements',
          content: runState.fundamentals_report,
        };
      case 'research':
        return {
          title:
            lang === 'zh-TW'
              ? '研究團隊 — 多空研究員辯論與研究總監綜合方案 (ResearchPlan)'
              : 'Research Team — Bull vs. Bear Debate & Research Plan',
          content: [
            lang === 'zh-TW' ? '### 看多研究員 (Bull Researcher) 論點' : '### Bull Researcher Arguments',
            runState.investment_debate_state.bull_history,
            '',
            lang === 'zh-TW' ? '### 看空研究員 (Bear Researcher) 論點' : '### Bear Researcher Arguments',
            runState.investment_debate_state.bear_history,
            '',
            lang === 'zh-TW' ? '### 研究總監綜合評估 (ResearchPlan)' : '### Research Manager Synthesis (ResearchPlan)',
            runState.investment_plan,
          ].join('\n'),
        };
      case 'trader':
        return {
          title:
            lang === 'zh-TW'
              ? '交易員代理 — 交易執行提案 (TraderProposal)'
              : 'Trader Agent — Transaction Proposal (TraderProposal)',
          content: runState.trader_investment_plan,
        };
      case 'risk':
        return {
          title:
            lang === 'zh-TW'
              ? '風險管理團隊 — 積極 / 保守 / 中立三方風控辯論'
              : 'Risk Management Team — Three-Way Risk Debate',
          content: [
            runState.risk_debate_state.aggressive_history,
            '',
            runState.risk_debate_state.conservative_history,
            '',
            runState.risk_debate_state.neutral_history,
          ].join('\n'),
        };
      case 'pm':
      default:
        return {
          title:
            lang === 'zh-TW'
              ? '投資組合經理 — 最終投資決策與風險調整配置 (PortfolioDecision)'
              : 'Portfolio Manager — Final Trade Decision (PortfolioDecision)',
          content: runState.final_trade_decision,
        };
    }
  };

  const activeReport = getReportContent();

  const ratingColor =
    runState.final_rating === 'Buy' || runState.final_rating === 'Overweight'
      ? 'text-[#087A59]'
      : runState.final_rating === 'Sell' || runState.final_rating === 'Underweight'
      ? 'text-[#B4372F]'
      : 'text-[#5D6670]';

  return (
    <div className="space-y-6">
      {/* Top Configuration & Instrument Identity Bar */}
      <section className="bg-white border border-[#E2E5E8] rounded-md p-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#E2E5E8]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {/* Step 1: Ticker */}
            <div>
              <label className="block text-xs font-medium text-[#5D6670] mb-1.5">
                {t.step1}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="e.g. NVDA, 0700.HK, BTC-USD"
                  className="w-full px-3 py-2 text-sm font-mono-tabular font-semibold bg-[#FBFBFA] border border-[#D3D8DC] rounded focus:outline-none focus:border-[#087A59]"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {QUICK_TICKERS.map((qt) => (
                  <button
                    key={qt}
                    type="button"
                    onClick={() => setTicker(qt)}
                    className={`px-2 py-0.5 text-[11px] font-mono-tabular rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      ticker.trim().toUpperCase() === qt
                        ? 'bg-[#1C2126] text-white font-medium'
                        : 'bg-[#F2F4F5] text-[#5D6670] hover:text-[#1C2126]'
                    }`}
                  >
                    {qt}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Analysis Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#5D6670]">
                  {t.step2}
                </label>
                {tradeDate !== todayStr && (
                  <button
                    type="button"
                    onClick={() => handleDateChange(todayStr)}
                    className="text-[11px] font-medium text-[#087A59] hover:underline cursor-pointer"
                  >
                    {lang === 'zh-TW' ? '設為今日' : 'Set Today'}
                  </button>
                )}
              </div>
              <input
                type="date"
                value={tradeDate}
                max={todayStr}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded focus:outline-none focus:border-[#087A59]"
              />
              {dateError ? (
                <p className="text-[11px] text-[#B4372F] mt-1">{dateError}</p>
              ) : (
                <p className="text-[11px] text-[#5D6670] mt-1">
                  {t.noLookAhead} {tradeDate} · {t.benchmark}: {snapshot.benchmarkTicker}
                </p>
              )}
            </div>

            {/* Step 3: LLM Provider */}
            <div>
              <label className="block text-xs font-medium text-[#5D6670] mb-1.5">
                {t.step3}
              </label>
              <select
                value={config.llm_provider}
                onChange={(e) => {
                  const nextProv = e.target.value;
                  const cat = PROVIDER_CATALOG[nextProv] || PROVIDER_CATALOG.google;
                  setConfig((prev) => ({
                    ...prev,
                    llm_provider: nextProv,
                    quick_think_llm: cat.quick[0].value,
                    deep_think_llm: cat.deep[0].value,
                  }));
                }}
                className="w-full px-3 py-2 text-sm bg-[#FBFBFA] border border-[#D3D8DC] rounded focus:outline-none focus:border-[#087A59]"
              >
                {Object.entries(PROVIDER_CATALOG).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#5D6670] mt-1 font-mono-tabular truncate">
                Quick: {config.quick_think_llm} · Deep: {config.deep_think_llm}
              </p>
            </div>

            {/* Step 4: Research Depth */}
            <div>
              <label className="block text-xs font-medium text-[#5D6670] mb-1.5">
                {t.step4}
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#F2F4F5] p-1 rounded">
                {[
                  { label: t.shallow, rounds: 1 },
                  { label: t.medium, rounds: 2 },
                  { label: t.deep, rounds: 3 },
                ].map((opt) => (
                  <button
                    key={opt.rounds}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        max_debate_rounds: opt.rounds,
                        max_risk_discuss_rounds: opt.rounds,
                      }))
                    }
                    className={`py-1.5 px-2 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      config.max_debate_rounds === opt.rounds
                        ? 'bg-white text-[#1C2126] shadow-xs'
                        : 'text-[#5D6670] hover:text-[#1C2126]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#5D6670] mt-1">
                {t.roundsInfo(config.max_debate_rounds, config.max_risk_discuss_rounds)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isFetchingLive}
              onClick={onFetchLiveSnapshot}
              className="px-3 py-2 text-xs font-medium text-[#087A59] bg-[#087A59]/8 border border-[#087A59]/30 hover:bg-[#087A59]/15 disabled:opacity-50 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin' : ''}`} />
              {isFetchingLive ? t.fetchingLive : t.fetchLiveBtn}
            </button>

            <button
              type="button"
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              className="px-3.5 py-2 text-xs font-medium text-[#1C2126] bg-[#F2F4F5] hover:bg-[#E2E5E8] rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showAdvancedConfig ? t.hideSettings : t.showSettings}
            </button>

            <button
              type="button"
              disabled={isRunning || !!dateError}
              onClick={onRunAnalysis}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#087A59] hover:bg-[#066347] disabled:opacity-50 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning ? t.propagatingGraph : t.propagateGraph}
            </button>
          </div>
        </div>

        {/* Step 5: Analyst Team Selection & Live API Status Bar */}
        <div className="pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#5D6670] mr-1">{t.analystTeamLabel}</span>
            {analystOptions.map((analyst) => {
              const active = selectedAnalysts.includes(analyst.key);
              return (
                <button
                  key={analyst.key}
                  type="button"
                  onClick={() => toggleAnalyst(analyst.key)}
                  className={`px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#087A59]/8 border-[#087A59] text-[#1C2126] font-medium'
                      : 'bg-[#FBFBFA] border-[#E2E5E8] text-[#5D6670] hover:text-[#1C2126]'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center border ${
                      active ? 'bg-[#087A59] border-[#087A59] text-white' : 'border-[#878F97]'
                    }`}
                  >
                    {active && <Check className="w-2.5 h-2.5" />}
                  </span>
                  <span>{analyst.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[#5D6670] flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-tabular">
            <span className="font-semibold text-[#1C2126]">{snapshot.companyName}</span>
            <span>·</span>
            <span>
              {t.exchange}: {snapshot.exchange}
            </span>
            <span>·</span>
            <span>
              {t.mode}: {snapshot.assetType}
            </span>
            <span>·</span>
            <span>
              {t.book}:{' '}
              {portfolio.mode === 'active'
                ? `${portfolio.positions.length} ${t.pos}`
                : portfolio.mode}
            </span>
          </div>
        </div>

        {/* Live Public API Verification Bar */}
        <div className="mt-3 pt-3 border-t border-[#E2E5E8] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tabular text-[#5D6670]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-sans font-medium text-[#1C2126]">{t.liveBadge.title}</span>
            <span>
              {t.liveBadge.yahoo}:{' '}
              <strong
                className={
                  snapshot.liveSources?.yahoo ? 'text-[#087A59]' : 'text-[#5D6670]'
                }
              >
                {snapshot.liveSources?.yahoo ? t.liveBadge.live : t.liveBadge.cached}
              </strong>
            </span>
            <span>·</span>
            <span>
              {t.liveBadge.sec}:{' '}
              <strong
                className={
                  snapshot.liveSources?.secEdgar ? 'text-[#087A59]' : 'text-[#5D6670]'
                }
              >
                {snapshot.liveSources?.secEdgar ? t.liveBadge.live : t.liveBadge.cached}
              </strong>
            </span>
            <span>·</span>
            <span>
              {t.liveBadge.poly}:{' '}
              <strong
                className={
                  snapshot.liveSources?.polymarket ? 'text-[#087A59]' : 'text-[#5D6670]'
                }
              >
                {snapshot.liveSources?.polymarket ? t.liveBadge.live : t.liveBadge.cached}
              </strong>
            </span>
          </div>
          {snapshot.liveSources?.fetchedAt && (
            <span>
              {lang === 'zh-TW' ? '更新時間' : 'Fetched'}: {snapshot.liveSources.fetchedAt}
            </span>
          )}
        </div>

        {/* Collapsible Tier Models, Vendors & Checkpoints Panel */}
        {showAdvancedConfig && (
          <div className="mt-4 pt-4 border-t border-[#E2E5E8] grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FBFBFA] p-4 rounded">
            <div>
              <h4 className="text-xs font-semibold text-[#1C2126] mb-2">{t.tierTitle}</h4>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] text-[#5D6670] mb-1">
                    {t.quickLlmLabel}
                  </label>
                  <select
                    value={config.quick_think_llm}
                    onChange={(e) => setConfig((p) => ({ ...p, quick_think_llm: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D3D8DC] rounded font-mono-tabular"
                  >
                    {providerModels.quick.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#5D6670] mb-1">
                    {t.deepLlmLabel}
                  </label>
                  <select
                    value={config.deep_think_llm}
                    onChange={(e) => setConfig((p) => ({ ...p, deep_think_llm: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D3D8DC] rounded font-mono-tabular"
                  >
                    {providerModels.deep.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#1C2126] mb-2">{t.vendorTitle}</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#5D6670]">{t.fundamentalsVendor}</span>
                  <select
                    value={config.data_vendors.fundamental_data}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        data_vendors: { ...p.data_vendors, fundamental_data: e.target.value },
                      }))
                    }
                    className="px-2 py-1 bg-white border border-[#D3D8DC] rounded font-mono-tabular text-[11px]"
                  >
                    <option value="sec_edgar,yfinance">sec_edgar → yfinance</option>
                    <option value="yfinance">yfinance only</option>
                    <option value="alpha_vantage,yfinance">alpha_vantage → yfinance</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5D6670]">{t.pricesVendor}</span>
                  <select
                    value={config.data_vendors.core_stock_apis}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        data_vendors: {
                          ...p.data_vendors,
                          core_stock_apis: e.target.value,
                          technical_indicators: e.target.value,
                        },
                      }))
                    }
                    className="px-2 py-1 bg-white border border-[#D3D8DC] rounded font-mono-tabular text-[11px]"
                  >
                    <option value="yfinance">yfinance</option>
                    <option value="alpha_vantage">alpha_vantage</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5D6670]">{t.macroVendor}</span>
                  <span className="font-mono-tabular text-[11px] text-[#1C2126]">
                    fred · polymarket
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#1C2126] mb-2">{t.checkpointTitle}</h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#5D6670]">{t.sqliteCheckpointer}</span>
                  <input
                    type="checkbox"
                    checked={config.checkpoint_enabled}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, checkpoint_enabled: e.target.checked }))
                    }
                    className="accent-[#087A59]"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#5D6670]">{t.jevScreening}</span>
                  <input
                    type="checkbox"
                    checked={config.jev_Repeat_screening}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, jev_Repeat_screening: e.target.checked }))
                    }
                    className="accent-[#087A59]"
                  />
                </label>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={onResetCheckpoints}
                    className="px-2.5 py-1 text-[11px] font-medium text-[#1C2126] bg-white border border-[#D3D8DC] rounded hover:bg-[#F2F4F5] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t.clearCheckpoints} ({checkpointClearedCount})
                  </button>
                  <span className="font-mono-tabular text-[11px] text-[#5D6670]">
                    {t.holdDays}: {config.holding_period_days}d
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Verified Data Snapshot Strip (Grounded Market, SEC EDGAR, Sentiment, Macro) */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#E2E5E8] rounded-md p-3.5">
          <div className="text-[11px] text-[#5D6670]">
            {t.cards.verifiedClose} ({snapshot.currency})
          </div>
          <div className="mt-1 flex items-baseline gap-2 font-mono-tabular">
            <span className="text-lg font-semibold text-[#1C2126]">
              {snapshot.latestClose.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-medium ${
                snapshot.dailyChangePct >= 0 ? 'text-[#087A59]' : 'text-[#B4372F]'
              }`}
            >
              {snapshot.dailyChangePct >= 0 ? '+' : ''}
              {snapshot.dailyChangePct}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#5D6670] font-mono-tabular">
            {t.cards.vol}: {snapshot.volume} · {t.cards.cap}: {snapshot.marketCap}
          </div>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-md p-3.5">
          <div className="text-[11px] text-[#5D6670]">{t.cards.techRegime}</div>
          <div className="mt-1 text-base font-semibold text-[#1C2126] font-mono-tabular">
            RSI {snapshot.rsi14.toFixed(1)} · MACD {snapshot.macdHist >= 0 ? '+' : ''}
            {snapshot.macdHist.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-[#5D6670] font-mono-tabular">
            SMA50: {snapshot.sma50.toFixed(1)} · SMA200: {snapshot.sma200.toFixed(1)}
          </div>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-md p-3.5">
          <div className="text-[11px] text-[#5D6670]">{t.cards.asFiled}</div>
          <div className="mt-1 text-base font-semibold text-[#1C2126] font-mono-tabular">
            Rev {snapshot.revenueGrowthYoY}
          </div>
          <div className="mt-1 text-[11px] text-[#5D6670] truncate">
            {t.cards.filed} {snapshot.secFilingDate} · OpM {snapshot.operatingMargin}
          </div>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-md p-3.5">
          <div className="text-[11px] text-[#5D6670]">{t.cards.jevSentiment}</div>
          <div className="mt-1 text-base font-semibold text-[#087A59] font-mono-tabular">
            {runState.sentiment_structured?.overall_band || 'Bullish'} (
            {runState.sentiment_structured?.overall_score.toFixed(1) || '7.6'}/10)
          </div>
          <div className="mt-1 text-[11px] text-[#5D6670] font-mono-tabular">
            ST {snapshot.stocktwitsBullishPct}% bull · {snapshot.jevDroppedCount} {t.cards.dropped}
          </div>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-md p-3.5">
          <div className="text-[11px] text-[#5D6670]">{t.cards.macroPoly}</div>
          <div className="mt-1 text-base font-semibold text-[#1C2126] font-mono-tabular">
            10Y {snapshot.fred10Y} · {t.cards.odds} {snapshot.polymarketProb}
          </div>
          <div className="mt-1 text-[11px] text-[#5D6670] truncate" title={snapshot.polymarketEvent}>
            {snapshot.polymarketEvent}
          </div>
        </div>

        <div className="bg-white border border-[#E2E5E8] rounded-md p-3.5">
          <div className="text-[11px] text-[#5D6670]">{t.cards.pmCall}</div>
          <div className={`mt-1 text-lg font-bold font-mono-tabular ${ratingColor}`}>
            {runState.final_rating}
          </div>
          <div className="mt-1 text-[11px] text-[#5D6670] font-mono-tabular">
            {t.cards.target}:{' '}
            {runState.pm_decision_structured?.price_target
              ? `${snapshot.currency} ${runState.pm_decision_structured.price_target}`
              : 'n/a'}
          </div>
        </div>
      </section>

      {/* Main Split: Left = Multi-Agent Pipeline Progress & Tool Log | Right = Live / Completed Agent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Agent Pipeline Status + Tool/Message Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Progress Panel */}
          <div className="bg-white border border-[#E2E5E8] rounded-md overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2E5E8] flex items-center justify-between bg-[#FBFBFA]">
              <div className="text-xs font-semibold text-[#1C2126]">
                {t.pipeline.title} ({completedCount}/{totalAgents} {t.pipeline.agents})
              </div>
              <div className="text-[11px] font-mono-tabular text-[#5D6670]">
                {isRunning
                  ? activeStageText
                  : t.pipeline.completedIn(runState.stats.elapsed_seconds.toFixed(1))}
              </div>
            </div>

            <div className="divide-y divide-[#E2E5E8]">
              {teams.map((team) => (
                <div key={team.name} className="p-3.5">
                  <div className="text-[11px] font-semibold text-[#5D6670] mb-2">{team.name}</div>
                  <div className="space-y-1.5">
                    {team.agents.map((ag) => {
                      const st = agentStatuses[ag.name] || 'completed';
                      return (
                        <div
                          key={ag.name}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-[#FBFBFA]"
                        >
                          <span className="font-medium text-[#1C2126]">{ag.displayLabel}</span>
                          <div className="flex items-center gap-3 font-mono-tabular">
                            {'wallTime' in ag && ag.wallTime !== undefined && st === 'completed' && (
                              <span className="text-[11px] text-[#5D6670]">{ag.wallTime.toFixed(2)}s</span>
                            )}
                            {st === 'completed' && (
                              <span className="text-[#087A59] font-medium flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                completed
                              </span>
                            )}
                            {st === 'in_progress' && (
                              <span className="text-[#D97706] font-medium flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                in_progress
                              </span>
                            )}
                            {st === 'pending' && <span className="text-[#878F97]">pending</span>}
                            {st === 'error' && (
                              <span className="text-[#B4372F] flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                error
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 bg-[#F2F4F5] border-t border-[#E2E5E8] flex flex-wrap items-center justify-between text-[11px] font-mono-tabular text-[#5D6670]">
              <span>
                {t.pipeline.llmCalls}: {runState.stats.llm_calls}
              </span>
              <span>·</span>
              <span>
                {t.pipeline.toolCalls}: {runState.stats.tool_calls}
              </span>
              <span>·</span>
              <span>
                {t.pipeline.tokens}: {(runState.stats.tokens_in / 1000).toFixed(1)}k↑{' '}
                {(runState.stats.tokens_out / 1000).toFixed(1)}k↓
              </span>
            </div>
          </div>

          {/* Messages & Tool Calls Log */}
          <div className="bg-white border border-[#E2E5E8] rounded-md overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2E5E8] flex items-center justify-between bg-[#FBFBFA]">
              <div className="text-xs font-semibold text-[#1C2126] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#5D6670]" />
                {t.pipeline.traceTitle}
              </div>
              <span className="text-[11px] font-mono-tabular text-[#5D6670]">
                {runState.tool_calls.length} {t.pipeline.toolsCount} · {runState.messages.length}{' '}
                {t.pipeline.eventsCount}
              </span>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E2E5E8] text-xs">
              {runState.tool_calls.map((tc) => (
                <div key={tc.id} className="p-3 hover:bg-[#FBFBFA]">
                  <div className="flex items-center justify-between font-mono-tabular text-[11px] text-[#5D6670]">
                    <span>
                      {tc.timestamp} · <strong className="text-[#1C2126]">{tc.agent}</strong> · Tool
                    </span>
                    <span>
                      {tc.vendor} ({tc.durationMs}ms)
                    </span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-[11.5px] text-[#087A59]">
                    {tc.toolName}({tc.args})
                  </div>
                </div>
              ))}
              {runState.messages.map((msg) => (
                <div key={msg.id} className="p-3 hover:bg-[#FBFBFA]">
                  <div className="flex items-center justify-between font-mono-tabular text-[11px] text-[#5D6670]">
                    <span>
                      {msg.timestamp} · <strong className="text-[#1C2126]">{msg.agent}</strong>
                    </span>
                    <span>{msg.type}</span>
                  </div>
                  <p className="mt-1 text-[#1C2126] leading-relaxed">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Interactive Agent Report Inspector */}
        <div className="lg:col-span-7 bg-white border border-[#E2E5E8] rounded-md overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E5E8] bg-[#FBFBFA] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#1C2126]">{t.inspector.title}</h3>
              <p className="text-xs text-[#5D6670]">{t.inspector.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onOpenReport}
              className="px-3 py-1.5 text-xs font-medium text-[#1C2126] bg-white border border-[#D3D8DC] rounded hover:bg-[#F2F4F5] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#087A59]" />
              {t.inspector.openComplete}
            </button>
          </div>

          {/* Segmented Report Selector Tabs */}
          <div className="px-5 py-2.5 bg-[#F2F4F5] border-b border-[#E2E5E8] flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'pm', label: t.inspector.tabs.pm },
              { id: 'trader', label: t.inspector.tabs.trader },
              { id: 'research', label: t.inspector.tabs.research },
              { id: 'risk', label: t.inspector.tabs.risk },
              { id: 'market', label: t.inspector.tabs.market },
              { id: 'fundamentals', label: t.inspector.tabs.fundamentals },
              { id: 'social', label: t.inspector.tabs.social },
              { id: 'news', label: t.inspector.tabs.news },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveReportTab(tab.id as typeof activeReportTab)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeReportTab === tab.id
                    ? 'bg-white text-[#1C2126] shadow-xs'
                    : 'text-[#5D6670] hover:text-[#1C2126]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Structured Key-Value Summary Banner for Decision Agents */}
          {activeReportTab === 'pm' && runState.pm_decision_structured && (
            <div className="px-6 py-4 bg-[#FBFBFA] border-b border-[#E2E5E8] grid grid-cols-3 gap-4 font-mono-tabular">
              <div>
                <div className="text-[11px] text-[#5D6670]">{t.inspector.pmRating}</div>
                <div className={`text-base font-bold mt-0.5 ${ratingColor}`}>
                  {runState.pm_decision_structured.rating}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#5D6670]">{t.inspector.priceTarget}</div>
                <div className="text-base font-semibold text-[#1C2126] mt-0.5">
                  {runState.pm_decision_structured.price_target !== null
                    ? `${snapshot.currency} ${runState.pm_decision_structured.price_target.toFixed(2)}`
                    : 'not provided'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#5D6670]">{t.inspector.horizon}</div>
                <div className="text-base font-semibold text-[#1C2126] mt-0.5">
                  {runState.pm_decision_structured.time_horizon || 'not provided'}
                </div>
              </div>
            </div>
          )}

          {activeReportTab === 'trader' && runState.trader_proposal_structured && (
            <div className="px-6 py-4 bg-[#FBFBFA] border-b border-[#E2E5E8] grid grid-cols-4 gap-4 font-mono-tabular">
              <div>
                <div className="text-[11px] text-[#5D6670]">{t.inspector.traderAction}</div>
                <div className="text-base font-bold text-[#087A59] mt-0.5">
                  {runState.trader_proposal_structured.action}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#5D6670]">{t.inspector.entryTarget}</div>
                <div className="text-base font-semibold text-[#1C2126] mt-0.5">
                  {runState.trader_proposal_structured.entry_price ?? 'n/a'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#5D6670]">{t.inspector.stopLoss}</div>
                <div className="text-base font-semibold text-[#B4372F] mt-0.5">
                  {runState.trader_proposal_structured.stop_loss ?? 'n/a'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#5D6670]">{t.inspector.sizing}</div>
                <div className="text-xs font-medium text-[#1C2126] mt-1 truncate">
                  {runState.trader_proposal_structured.position_sizing ?? 'Standard'}
                </div>
              </div>
            </div>
          )}

          {/* Markdown Report Body */}
          <div className="p-6">
            <div className="pb-3 mb-4 border-b border-[#E2E5E8] flex items-center justify-between">
              <h4 className="text-base font-semibold text-[#1C2126]">{activeReport.title}</h4>
              <span className="text-xs font-mono-tabular text-[#5D6670]">
                {runState.company_of_interest} · {runState.trade_date}
              </span>
            </div>
            <MarkdownBlock content={activeReport.content} editorialSerif={true} />

            {/* Past Memory Context Injected into PM */}
            {activeReportTab === 'pm' && runState.past_context && (
              <div className="mt-6 pt-5 border-t border-[#E2E5E8]">
                <div className="text-xs font-semibold text-[#5D6670] mb-2">
                  {t.inspector.memoryInjected} (as_of={runState.trade_date})
                </div>
                <pre className="p-3.5 bg-[#F2F4F5] border border-[#E2E5E8] rounded text-xs font-mono-tabular text-[#1C2126] whitespace-pre-wrap leading-relaxed">
                  {runState.past_context}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
