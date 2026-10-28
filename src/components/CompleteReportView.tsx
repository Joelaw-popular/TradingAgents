import React from 'react';
import { AnalysisRunState } from '../types/trading';
import { UI_TEXT, UILanguage } from '../utils/i18n';
import { MarkdownBlock } from './MarkdownBlock';
import { generateStandaloneReportHtml } from '../utils/reportHtml';
import { Download, FileCode, Printer } from 'lucide-react';

interface CompleteReportViewProps {
  lang: UILanguage;
  runState: AnalysisRunState;
}

export const CompleteReportView: React.FC<CompleteReportViewProps> = ({ lang, runState }) => {
  const t = UI_TEXT[lang].report;
  const s = runState.run_settings;

  const handleDownloadHtml = () => {
    const html = generateStandaloneReportHtml(runState);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complete_report_${runState.company_of_interest}_${runState.trade_date}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJsonState = () => {
    const json = JSON.stringify(runState, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `full_states_log_${runState.company_of_interest}_${runState.trade_date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const ratingColor =
    runState.final_rating === 'Buy' || runState.final_rating === 'Overweight'
      ? 'text-[#087A59]'
      : runState.final_rating === 'Sell' || runState.final_rating === 'Underweight'
      ? 'text-[#B4372F]'
      : 'text-[#5D6670]';

  const sections = [
    {
      id: 's1',
      num: 'I',
      heading: lang === 'zh-TW' ? 'I. 分析師團隊報告' : 'I. Analyst Team Reports',
      agents: [
        ...(runState.market_report
          ? [
              {
                id: 's1-1',
                name: lang === 'zh-TW' ? '市場技術分析師 (Market Analyst)' : 'Market Analyst',
                content: runState.market_report,
              },
            ]
          : []),
        ...(runState.sentiment_report
          ? [
              {
                id: 's1-2',
                name: lang === 'zh-TW' ? '社群情緒分析師 (Sentiment Analyst)' : 'Sentiment Analyst',
                content: runState.sentiment_report,
              },
            ]
          : []),
        ...(runState.news_report
          ? [
              {
                id: 's1-3',
                name: lang === 'zh-TW' ? '宏觀新聞分析師 (News Analyst)' : 'News Analyst',
                content: runState.news_report,
              },
            ]
          : []),
        ...(runState.fundamentals_report
          ? [
              {
                id: 's1-4',
                name:
                  lang === 'zh-TW'
                    ? '基本面財報分析師 (Fundamentals Analyst)'
                    : 'Fundamentals Analyst',
                content: runState.fundamentals_report,
              },
            ]
          : []),
      ],
    },
    {
      id: 's2',
      num: 'II',
      heading: lang === 'zh-TW' ? 'II. 多空研究團隊決策' : 'II. Research Team Decision',
      agents: [
        {
          id: 's2-1',
          name: lang === 'zh-TW' ? '看多研究員 (Bull Researcher)' : 'Bull Researcher',
          content: runState.investment_debate_state.bull_history,
        },
        {
          id: 's2-2',
          name: lang === 'zh-TW' ? '看空研究員 (Bear Researcher)' : 'Bear Researcher',
          content: runState.investment_debate_state.bear_history,
        },
        {
          id: 's2-3',
          name: lang === 'zh-TW' ? '研究總監 (Research Manager)' : 'Research Manager',
          content: runState.investment_plan,
        },
      ],
    },
    {
      id: 's3',
      num: 'III',
      heading: lang === 'zh-TW' ? 'III. 交易執行計畫' : 'III. Trading Team Plan',
      agents: [
        {
          id: 's3-1',
          name: lang === 'zh-TW' ? '交易員 (Trader)' : 'Trader',
          content: runState.trader_investment_plan,
        },
      ],
    },
    {
      id: 's4',
      num: 'IV',
      heading: lang === 'zh-TW' ? 'IV. 風險管理團隊辯論' : 'IV. Risk Management Team Decision',
      agents: [
        {
          id: 's4-1',
          name: lang === 'zh-TW' ? '積極派風控分析師 (Aggressive Analyst)' : 'Aggressive Analyst',
          content: runState.risk_debate_state.aggressive_history,
        },
        {
          id: 's4-2',
          name:
            lang === 'zh-TW' ? '保守派風控分析師 (Conservative Analyst)' : 'Conservative Analyst',
          content: runState.risk_debate_state.conservative_history,
        },
        {
          id: 's4-3',
          name: lang === 'zh-TW' ? '中立派風控分析師 (Neutral Analyst)' : 'Neutral Analyst',
          content: runState.risk_debate_state.neutral_history,
        },
      ],
    },
    {
      id: 's5',
      num: 'V',
      heading: lang === 'zh-TW' ? 'V. 投資組合經理最終決策' : 'V. Portfolio Management Decision',
      agents: [
        {
          id: 's5-1',
          name: lang === 'zh-TW' ? '投資組合經理 (Portfolio Manager)' : 'Portfolio Manager',
          content: runState.final_trade_decision,
        },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Rail: Contents Navigation & Export Controls */}
      <aside className="lg:col-span-3 lg:sticky lg:top-6 bg-white border border-[#E2E5E8] rounded-md p-5 space-y-5">
        <div>
          <div className="text-xs font-semibold text-[#1C2126] mb-3">{t.sectionsTitle}</div>
          <nav className="space-y-3 text-xs">
            {sections.map((sec) => (
              <div key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className="font-semibold text-[#1C2126] hover:text-[#087A59] flex items-center gap-2"
                >
                  <span className="font-mono-tabular text-[#5D6670] w-5">{sec.num}.</span>
                  <span>{sec.heading.replace(/^[IVX]+\.\s*/, '')}</span>
                </a>
                <ul className="mt-1 pl-7 space-y-1 text-[#5D6670]">
                  {sec.agents.map((ag) => (
                    <li key={ag.id}>
                      <a href={`#${ag.id}`} className="hover:text-[#087A59] hover:underline">
                        {ag.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#E2E5E8] space-y-2">
          <div className="text-xs font-semibold text-[#1C2126] mb-2">{t.exportTitle}</div>
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="w-full px-3 py-2 text-xs font-medium text-white bg-[#087A59] hover:bg-[#066347] rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {t.downloadHtml}
          </button>
          <button
            type="button"
            onClick={handleDownloadJsonState}
            className="w-full px-3 py-2 text-xs font-medium text-[#1C2126] bg-[#F2F4F5] hover:bg-[#E2E5E8] rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            {t.downloadJson}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full px-3 py-2 text-xs font-medium text-[#5D6670] bg-white border border-[#D3D8DC] hover:text-[#1C2126] rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            {t.printReport}
          </button>
        </div>
      </aside>

      {/* Main Document Column */}
      <article className="lg:col-span-9 bg-white border border-[#E2E5E8] rounded-md p-6 sm:p-10 max-w-4xl">
        {/* Masthead */}
        <header className="pb-6 border-b border-[#E2E5E8]">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C2126]">
              {runState.company_of_interest}
            </h1>
            <span className={`text-2xl sm:text-3xl font-medium ${ratingColor}`}>
              {runState.final_rating}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-[#5D6670]">
            {t.analysisOf} {runState.trade_date} · {runState.instrument_context}
          </p>

          {/* Run Settings Metadata Grid */}
          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div className="flex items-baseline gap-2">
              <dt className="text-[#5D6670] w-28 shrink-0">{t.deepModel}</dt>
              <dd className="font-mono-tabular">
                <span className="px-1.5 py-0.5 bg-[#F2F4F5] border border-[#D3D8DC] rounded mr-1">
                  {s.deep_think_provider}
                </span>
                <span className="px-1.5 py-0.5 bg-[#F2F4F5] border border-[#D3D8DC] rounded">
                  {s.deep_think_llm}
                </span>
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-[#5D6670] w-28 shrink-0">{t.quickModel}</dt>
              <dd className="font-mono-tabular">
                <span className="px-1.5 py-0.5 bg-[#F2F4F5] border border-[#D3D8DC] rounded mr-1">
                  {s.quick_think_provider}
                </span>
                <span className="px-1.5 py-0.5 bg-[#F2F4F5] border border-[#D3D8DC] rounded">
                  {s.quick_think_llm}
                </span>
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-[#5D6670] w-28 shrink-0">{t.analysts}</dt>
              <dd className="font-mono-tabular flex flex-wrap gap-1">
                {s.analysts.map((a) => (
                  <span
                    key={a}
                    className="px-1.5 py-0.5 bg-[#F2F4F5] border border-[#D3D8DC] rounded"
                  >
                    {a}
                  </span>
                ))}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-[#5D6670] w-28 shrink-0">{t.debateRounds}</dt>
              <dd className="font-mono-tabular">
                research{' '}
                <span className="px-1.5 py-0.5 bg-[#F2F4F5] border border-[#D3D8DC] rounded">
                  {s.max_debate_rounds}
                </span>{' '}
                · risk{' '}
                <span className="px-1.5 py-0.5 bg-[#F2F4F5] border border-[#D3D8DC] rounded">
                  {s.max_risk_discuss_rounds}
                </span>
              </dd>
            </div>
            <div className="flex items-baseline gap-2 sm:col-span-2">
              <dt className="text-[#5D6670] w-28 shrink-0">{t.dataVendors}</dt>
              <dd className="font-mono-tabular text-[11px] text-[#1C2126]">
                Prices: {s.data_vendors.core_stock_apis} · Fundamentals:{' '}
                {s.data_vendors.fundamental_data} · News: {s.data_vendors.news_data} · Macro:{' '}
                {s.data_vendors.macro_data} · Prediction: {s.data_vendors.prediction_markets}
              </dd>
            </div>
          </dl>
        </header>

        {/* Report Body Sections */}
        <div className="space-y-10 mt-8">
          {sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-6">
              <h2 className="text-xl font-semibold text-[#1C2126] pt-4 border-t-2 border-[#1C2126] mb-4">
                {sec.heading}
              </h2>
              <div className="space-y-8">
                {sec.agents.map((ag) => (
                  <div
                    key={ag.id}
                    id={ag.id}
                    className="pt-4 first:pt-0 border-t first:border-t-0 border-[#E2E5E8] scroll-mt-6"
                  >
                    <h3 className="text-base font-semibold text-[#087A59] mb-2.5">{ag.name}</h3>
                    <MarkdownBlock content={ag.content} editorialSerif={true} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-5 border-t border-[#E2E5E8] text-xs text-[#5D6670] flex items-center justify-between">
          <span>TradingAgents v{s.version} · Multi-Agent Financial Trading Research Framework</span>
          <span className="font-mono-tabular">
            {t.portfolioHash}: {runState.portfolio_fingerprint}
          </span>
        </footer>
      </article>
    </div>
  );
};
