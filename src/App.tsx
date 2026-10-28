import React, { useState, useEffect, useCallback } from 'react';
import {
  AgentStatusValue,
  AnalysisRunState,
  AnalystKey,
  BacktestSummary,
  InstrumentSnapshot,
  MemoryLogEntry,
  PortfolioContextState,
  RunConfig,
} from './types/trading';
import {
  buildPresetAnalysisRun,
  DEFAULT_RUN_CONFIG,
  getTodayDateStr,
  INITIAL_BACKTEST_SUMMARY,
  INITIAL_MEMORY_LOG,
  INITIAL_PORTFOLIO,
} from './data/presets';
import { UI_TEXT, UILanguage } from './utils/i18n';
import { AnalysisDeskView } from './components/AnalysisDeskView';
import { CompleteReportView } from './components/CompleteReportView';
import { PortfolioBookView } from './components/PortfolioBookView';
import { BacktestGridView } from './components/BacktestGridView';
import { MemoryLogView } from './components/MemoryLogView';
import { Languages } from 'lucide-react';

type ActiveTab = 'desk' | 'report' | 'portfolio' | 'backtest' | 'memory';

export function App() {
  const [lang, setLang] = useState<UILanguage>('zh-TW');
  const [activeTab, setActiveTab] = useState<ActiveTab>('desk');
  const [ticker, setTicker] = useState<string>('NVDA');
  const [tradeDate, setTradeDate] = useState<string>(() => getTodayDateStr());
  const [selectedAnalysts, setSelectedAnalysts] = useState<AnalystKey[]>([
    'market',
    'social',
    'news',
    'fundamentals',
  ]);
  const [config, setConfig] = useState<RunConfig>(DEFAULT_RUN_CONFIG);
  const [portfolio, setPortfolio] = useState<PortfolioContextState>(INITIAL_PORTFOLIO);
  const [memoryLog, setMemoryLog] = useState<MemoryLogEntry[]>(INITIAL_MEMORY_LOG);
  const [backtestSummary, setBacktestSummary] = useState<BacktestSummary>(INITIAL_BACKTEST_SUMMARY);

  const [liveSnapshot, setLiveSnapshot] = useState<InstrumentSnapshot | null>(null);
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);

  const [runState, setRunState] = useState<AnalysisRunState>(() =>
    buildPresetAnalysisRun(
      'NVDA',
      getTodayDateStr(),
      DEFAULT_RUN_CONFIG,
      INITIAL_PORTFOLIO,
      INITIAL_MEMORY_LOG,
      undefined,
      'zh-TW'
    )
  );

  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatusValue>>({
    'Market Analyst': 'completed',
    'Sentiment Analyst': 'completed',
    'News Analyst': 'completed',
    'Fundamentals Analyst': 'completed',
    'Bull Researcher': 'completed',
    'Bear Researcher': 'completed',
    'Research Manager': 'completed',
    Trader: 'completed',
    'Aggressive Analyst': 'completed',
    'Neutral Analyst': 'completed',
    'Conservative Analyst': 'completed',
    'Portfolio Manager': 'completed',
  });

  const [isRunning, setIsRunning] = useState(false);
  const [activeStageText, setActiveStageText] = useState('Idle');
  const [isSettling, setIsSettling] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [checkpointClearedCount, setCheckpointClearedCount] = useState(0);

  const fetchLiveSnapshotData = useCallback(
    async (targetTicker: string, targetDate: string, targetLang: UILanguage) => {
      const sym = targetTicker.trim().toUpperCase();
      if (!sym) return;
      setIsFetchingLive(true);
      try {
        const res = await fetch(
          `/api/live-snapshot?ticker=${encodeURIComponent(sym)}&tradeDate=${encodeURIComponent(targetDate)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.snapshot) {
            setLiveSnapshot(data.snapshot);
            setRunState((prev) => {
              if (prev.company_of_interest.toUpperCase() === sym) {
                return buildPresetAnalysisRun(
                  sym,
                  targetDate,
                  config,
                  portfolio,
                  memoryLog,
                  data.snapshot,
                  targetLang
                );
              }
              return prev;
            });
          }
        }
      } catch {
        // Fallback silently if offline
      } finally {
        setIsFetchingLive(false);
      }
    },
    [config, portfolio, memoryLog]
  );

  // Automatically fetch live public APIs on initial load
  useEffect(() => {
    fetchLiveSnapshotData('NVDA', getTodayDateStr(), 'zh-TW');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleLanguage = () => {
    const nextLang: UILanguage = lang === 'en' ? 'zh-TW' : 'en';
    setLang(nextLang);
    const snap =
      liveSnapshot && liveSnapshot.ticker.toUpperCase() === ticker.trim().toUpperCase()
        ? liveSnapshot
        : undefined;
    setRunState(
      buildPresetAnalysisRun(ticker, tradeDate, config, portfolio, memoryLog, snap, nextLang)
    );
  };

  const handleRunAnalysis = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab('desk');

    const analystNameMap: Record<AnalystKey, string> = {
      market: 'Market Analyst',
      social: 'Sentiment Analyst',
      news: 'News Analyst',
      fundamentals: 'Fundamentals Analyst',
    };

    const initialStatuses: Record<string, AgentStatusValue> = {};
    selectedAnalysts.forEach((k) => {
      initialStatuses[analystNameMap[k]] = 'in_progress';
    });
    [
      'Bull Researcher',
      'Bear Researcher',
      'Research Manager',
      'Trader',
      'Aggressive Analyst',
      'Neutral Analyst',
      'Conservative Analyst',
      'Portfolio Manager',
    ].forEach((name) => {
      initialStatuses[name] = 'pending';
    });
    setAgentStatuses(initialStatuses);
    setActiveStageText(
      lang === 'zh-TW'
        ? 'I. 分析師團隊並行呼叫公開 API 與執行中...'
        : 'I. Analyst Team running in parallel...'
    );

    try {
      const responsePromise = fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          tradeDate,
          selectedAnalysts,
          config,
          portfolio,
          memoryEntries: memoryLog,
          lang,
        }),
      });

      await new Promise((r) => setTimeout(r, 450));
      setAgentStatuses((prev) => {
        const next = { ...prev };
        selectedAnalysts.forEach((k) => {
          next[analystNameMap[k]] = 'completed';
        });
        next['Bull Researcher'] = 'in_progress';
        next['Bear Researcher'] = 'in_progress';
        return next;
      });
      setActiveStageText(
        lang === 'zh-TW'
          ? 'II. 多空研究員進行辯論中...'
          : 'II. Research Team Bull/Bear Debate...'
      );

      await new Promise((r) => setTimeout(r, 450));
      setAgentStatuses((prev) => ({
        ...prev,
        'Bull Researcher': 'completed',
        'Bear Researcher': 'completed',
        'Research Manager': 'in_progress',
      }));
      setActiveStageText(
        lang === 'zh-TW'
          ? 'II. 研究總監與投資組合經理綜合決策中...'
          : 'II. Research Manager synthesizing ResearchPlan...'
      );

      const res = await responsePromise;
      let nextRunState: AnalysisRunState;
      if (res.ok) {
        const data = await res.json();
        nextRunState = data.runState;
        if (data.snapshot || data.liveSnapshot) {
          setLiveSnapshot(data.snapshot || data.liveSnapshot);
        }
      } else {
        nextRunState = buildPresetAnalysisRun(
          ticker,
          tradeDate,
          config,
          portfolio,
          memoryLog,
          liveSnapshot || undefined,
          lang
        );
      }

      setAgentStatuses((prev) => ({
        ...prev,
        'Research Manager': 'completed',
        Trader: 'completed',
        'Aggressive Analyst': 'completed',
        'Neutral Analyst': 'completed',
        'Conservative Analyst': 'completed',
        'Portfolio Manager': 'completed',
      }));

      setRunState(nextRunState);

      setMemoryLog((prev) => {
        const exists = prev.some(
          (e) => e.ticker === nextRunState.company_of_interest && e.date === nextRunState.trade_date
        );
        if (exists) return prev;
        return [
          {
            id: `mem-${Date.now()}`,
            date: nextRunState.trade_date,
            ticker: nextRunState.company_of_interest,
            rating: nextRunState.final_rating,
            pending: true,
            raw: null,
            alpha: null,
            holding: null,
            resolved: null,
            decision: nextRunState.final_trade_decision,
            reflection: '',
          },
          ...prev,
        ];
      });
    } catch {
      const fallback = buildPresetAnalysisRun(
        ticker,
        tradeDate,
        config,
        portfolio,
        memoryLog,
        liveSnapshot || undefined,
        lang
      );
      setRunState(fallback);
      setAgentStatuses((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = 'completed';
        });
        return next;
      });
    } finally {
      setIsRunning(false);
      setActiveStageText(lang === 'zh-TW' ? '已完成' : 'Completed');
    }
  };

  const handleSettlePending = async () => {
    setIsSettling(true);
    try {
      const res = await fetch('/api/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: memoryLog,
          holdingDays: config.holding_period_days,
          lang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.entries)) {
          setMemoryLog(data.entries);
        }
      }
    } finally {
      setIsSettling(false);
    }
  };

  const handleRunBacktestSweep = async (params: {
    tickers: string[];
    startDate: string;
    endDate: string;
    everyNDays: number;
    holdingDays: number;
  }) => {
    setIsSweeping(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setBacktestSummary(data.summary);
        }
      }
    } finally {
      setIsSweeping(false);
    }
  };

  const t = UI_TEXT[lang];

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'desk', label: t.nav.desk },
    { id: 'report', label: t.nav.report },
    { id: 'portfolio', label: t.nav.portfolio },
    { id: 'backtest', label: t.nav.backtest },
    { id: 'memory', label: t.nav.memory },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1C2126]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-[#E2E5E8]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#desk"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('desk');
          }}
          className="text-lg font-bold tracking-tight text-[#1C2126] whitespace-nowrap shrink-0"
        >
          TradingAgents
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5D6670]">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
              }}
              className={`transition-colors whitespace-nowrap shrink-0 py-0.5 ${
                activeTab === item.id
                  ? 'text-[#1C2126] underline decoration-[#087A59] decoration-2 underline-offset-4 font-semibold'
                  : 'hover:text-[#1C2126]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Language Switcher + Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="px-3 py-2 text-xs font-medium text-[#1C2126] bg-[#F2F4F5] hover:bg-[#E2E5E8] border border-[#D3D8DC] rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="切換語言 / Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-[#087A59]" />
            {t.header.langToggle}
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={handleRunAnalysis}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#087A59] rounded hover:bg-[#066347] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isRunning ? t.header.runningGraph : t.header.runAnalysis}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border-b border-[#E2E5E8] overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
              activeTab === item.id ? 'bg-[#1C2126] text-white' : 'text-[#5D6670]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'desk' && (
          <AnalysisDeskView
            lang={lang}
            ticker={ticker}
            setTicker={(nextTicker) => {
              setTicker(nextTicker);
              const preset = buildPresetAnalysisRun(
                nextTicker,
                tradeDate,
                config,
                portfolio,
                memoryLog,
                undefined,
                lang
              );
              setRunState(preset);
              fetchLiveSnapshotData(nextTicker, tradeDate, lang);
            }}
            tradeDate={tradeDate}
            setTradeDate={(nextDate) => {
              setTradeDate(nextDate);
              fetchLiveSnapshotData(ticker, nextDate, lang);
            }}
            selectedAnalysts={selectedAnalysts}
            setSelectedAnalysts={setSelectedAnalysts}
            config={config}
            setConfig={setConfig}
            portfolio={portfolio}
            runState={runState}
            agentStatuses={agentStatuses}
            isRunning={isRunning}
            activeStageText={activeStageText}
            onRunAnalysis={handleRunAnalysis}
            onOpenReport={() => setActiveTab('report')}
            onResetCheckpoints={() => setCheckpointClearedCount((c) => c + 1)}
            checkpointClearedCount={checkpointClearedCount}
            liveSnapshot={liveSnapshot}
            isFetchingLive={isFetchingLive}
            onFetchLiveSnapshot={() => fetchLiveSnapshotData(ticker, tradeDate, lang)}
          />
        )}

        {activeTab === 'report' && <CompleteReportView lang={lang} runState={runState} />}

        {activeTab === 'portfolio' && (
          <PortfolioBookView
            lang={lang}
            portfolio={portfolio}
            setPortfolio={setPortfolio}
            activeTicker={ticker}
          />
        )}

        {activeTab === 'backtest' && (
          <BacktestGridView
            lang={lang}
            summary={backtestSummary}
            onRunSweep={handleRunBacktestSweep}
            isSweeping={isSweeping}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryLogView
            lang={lang}
            entries={memoryLog}
            onSettlePending={handleSettlePending}
            isSettling={isSettling}
          />
        )}
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="border-t border-[#E2E5E8] bg-white px-6 py-4 text-xs text-[#5D6670]">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>{t.footer.left}</div>
          <div>{t.footer.right}</div>
        </div>
      </footer>
    </div>
  );
}
export default App;
