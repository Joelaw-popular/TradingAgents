import {
  AnalysisRunState,
  AssetType,
  BacktestSummary,
  InstrumentSnapshot,
  MemoryLogEntry,
  PortfolioContextState,
  PortfolioDecision,
  PortfolioRating,
  ResearchPlan,
  RunConfig,
  SentimentBand,
  SentimentReport,
  TraderAction,
  TraderProposal,
} from '../types/trading';

export const BENCHMARK_MAP: Record<string, { ticker: string; name: string }> = {
  '.NS': { ticker: '^NSEI', name: 'Nifty 50 (India)' },
  '.BO': { ticker: '^BSESN', name: 'BSE Sensex (India)' },
  '.T': { ticker: '^N225', name: 'Nikkei 225 (Tokyo)' },
  '.TW': { ticker: '^TWII', name: 'TAIEX (Taiwan)' },
  '.KS': { ticker: '^KS11', name: 'KOSPI (Korea)' },
  '.HK': { ticker: '^HSI', name: 'Hang Seng Index (Hong Kong)' },
  '.SI': { ticker: '^STI', name: 'Straits Times (Singapore)' },
  '.L': { ticker: '^FTSE', name: 'FTSE 100 (London)' },
  '.DE': { ticker: '^GDAXI', name: 'DAX (Frankfurt)' },
  '.PA': { ticker: '^FCHI', name: 'CAC 40 (Paris)' },
  '.TO': { ticker: '^GSPTSE', name: 'TSX Composite (Toronto)' },
  '.AX': { ticker: '^AXJO', name: 'ASX 200 (Sydney)' },
  '.SS': { ticker: '000001.SS', name: 'SSE Composite (Shanghai)' },
  '.SZ': { ticker: '399001.SZ', name: 'SZSE Component (Shenzhen)' },
  '': { ticker: 'SPY', name: 'S&P 500 ETF (US)' },
};

export function resolveBenchmark(ticker: string, override?: string | null): { ticker: string; name: string } {
  if (override && override.trim()) {
    return { ticker: override.trim().toUpperCase(), name: `Custom Benchmark (${override.trim().toUpperCase()})` };
  }
  const upper = ticker.trim().toUpperCase();
  if (upper.endsWith('-USD') || upper.endsWith('-USDT')) {
    return { ticker: 'BTC-USD', name: 'Bitcoin Spot Benchmark' };
  }
  const dotIdx = upper.lastIndexOf('.');
  if (dotIdx > 0) {
    const suffix = upper.slice(dotIdx);
    if (BENCHMARK_MAP[suffix]) {
      return BENCHMARK_MAP[suffix];
    }
  }
  return BENCHMARK_MAP[''];
}

export function detectAssetType(ticker: string): AssetType {
  const upper = ticker.trim().toUpperCase();
  if (
    upper.endsWith('-USD') ||
    upper.endsWith('-USDT') ||
    ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA', 'AVAX'].includes(upper)
  ) {
    return 'crypto';
  }
  return 'stock';
}

export const PROVIDER_CATALOG: Record<
  string,
  {
    label: string;
    quick: { label: string; value: string }[];
    deep: { label: string; value: string }[];
  }
> = {
  google: {
    label: 'Google (Gemini)',
    quick: [
      { label: 'Gemini 3.8 Flash — Most capable Flash', value: 'gemini-3.8-flash' },
      { label: 'Gemini 3.5 Flash Lite — Fast and cost-efficient', value: 'gemini-3.5-flash-lite' },
      { label: 'Gemini 3.1 Flash Lite — Most cost-efficient', value: 'gemini-3.1-flash-lite' },
    ],
    deep: [
      { label: 'Gemini 3.8 Flash — Most capable Flash, 1M context', value: 'gemini-3.8-flash' },
      { label: 'Gemini 3.1 Pro — Reasoning-first, complex workflows', value: 'gemini-3.1-pro-preview' },
      { label: 'Gemini 3.5 Flash — Strong agentic + coding', value: 'gemini-3.5-flash' },
    ],
  },
  openai: {
    label: 'OpenAI (GPT)',
    quick: [
      { label: 'GPT-6 Luna — Fast, high-volume and cost-efficient', value: 'gpt-6-luna' },
      { label: 'GPT-5.6 Luna — Previous-gen fast tier', value: 'gpt-5.6-luna' },
      { label: 'GPT-5.6 Terra — Balances intelligence and cost', value: 'gpt-5.6-terra' },
    ],
    deep: [
      { label: 'GPT-6 Sol — Complex reasoning and analysis', value: 'gpt-6-sol' },
      { label: 'GPT-6 Astra — Hardest multi-step reasoning', value: 'gpt-6-astra' },
      { label: 'GPT-5.6 — Previous-gen reasoning (Sol)', value: 'gpt-5.6' },
    ],
  },
  anthropic: {
    label: 'Anthropic (Claude)',
    quick: [
      { label: 'Claude Sonnet 5 — Best speed and intelligence balance', value: 'claude-sonnet-5' },
      { label: 'Claude Haiku 4.5 — Fastest with near-frontier intelligence', value: 'claude-haiku-4-5' },
    ],
    deep: [
      { label: 'Claude Opus 5.5 — Frontier agentic and enterprise work', value: 'claude-opus-5-5' },
      { label: 'Claude Fable 5.1 — Demanding long-horizon reasoning', value: 'claude-fable-5-1' },
      { label: 'Claude Sonnet 5 — Near-frontier intelligence', value: 'claude-sonnet-5' },
    ],
  },
  deepseek: {
    label: 'DeepSeek',
    quick: [{ label: 'DeepSeek Flash — V4.1 Flash, fast, 1M ctx', value: 'deepseek-flash' }],
    deep: [
      { label: 'DeepSeek V4 Pro — Flagship', value: 'deepseek-v4-pro' },
      { label: 'DeepSeek Flash — V4.1 Flash, fast, 1M ctx', value: 'deepseek-flash' },
    ],
  },
  xai: {
    label: 'xAI (Grok)',
    quick: [
      { label: 'Grok 4.6 — Latest flagship, fastest, 500K ctx', value: 'grok-4.6' },
      { label: 'Grok Build 0.1 — Coding-specialized, 256K ctx', value: 'grok-build-0.1' },
    ],
    deep: [
      { label: 'Grok 4.6 — Latest flagship, 500K ctx', value: 'grok-4.6' },
      { label: 'Grok 4.5 — Previous flagship, coding and agentic', value: 'grok-4.5' },
    ],
  },
  qwen: {
    label: 'Qwen (DashScope)',
    quick: [{ label: 'Qwen 3.8 Flash — Latest fast model, 1M ctx', value: 'qwen3.8-flash' }],
    deep: [
      { label: 'Qwen 3.8 Max — Latest flagship', value: 'qwen3.8-max' },
      { label: 'Qwen 3.8 Flash — Fast alternative, 1M ctx', value: 'qwen3.8-flash' },
    ],
  },
  glm: {
    label: 'GLM (Z.AI / BigModel)',
    quick: [
      { label: 'GLM-5.3-Flash — Fast, cost-efficient, 1M ctx', value: 'glm-5.3-flash' },
      { label: 'GLM-5-Turbo — Fast, switchable thinking modes', value: 'glm-5-turbo' },
    ],
    deep: [
      { label: 'GLM-5.3 — Latest flagship, 1M ctx', value: 'glm-5.3' },
      { label: 'GLM-5.2 — 744B, 1M ctx', value: 'glm-5.2' },
    ],
  },
};

export const DEFAULT_RUN_CONFIG: RunConfig = {
  llm_provider: 'google',
  quick_think_provider: null,
  quick_think_llm: 'gemini-3.8-flash',
  deep_think_provider: null,
  deep_think_llm: 'gemini-3.8-flash',
  max_debate_rounds: 2,
  max_risk_discuss_rounds: 2,
  max_tool_rounds: 20,
  temperature: 0.1,
  output_language: 'English',
  checkpoint_enabled: true,
  holding_period_days: 5,
  benchmark_ticker: null,
  jev_Repeat_screening: true,
  reasoning_effort: 'high',
  data_vendors: {
    core_stock_apis: 'yfinance',
    technical_indicators: 'yfinance',
    fundamental_data: 'sec_edgar,yfinance',
    news_data: 'yfinance',
    macro_data: 'fred',
    prediction_markets: 'polymarket',
  },
};

export function renderSentimentReport(report: SentimentReport): string {
  return [
    `**Overall Sentiment:** **${report.overall_band}** (Score: ${report.overall_score.toFixed(1)}/10)`,
    `**Confidence:** ${report.confidence.charAt(0).toUpperCase() + report.confidence.slice(1)}`,
    '',
    report.narrative,
  ].join('\n');
}

export function renderResearchPlan(plan: ResearchPlan): string {
  return [
    `**Recommendation**: ${plan.recommendation}`,
    '',
    `**Rationale**: ${plan.rationale}`,
    '',
    `**Strategic Actions**: ${plan.strategic_actions}`,
  ].join('\n');
}

export function renderTraderProposal(proposal: TraderProposal): string {
  const parts = [
    `**Action**: ${proposal.action}`,
    '',
    `**Reasoning**: ${proposal.reasoning}`,
    '',
    `**Entry Price**: ${proposal.entry_price !== null ? proposal.entry_price : 'not provided'}`,
    '',
    `**Stop Loss**: ${proposal.stop_loss !== null ? proposal.stop_loss : 'not provided'}`,
    '',
    `**Position Sizing**: ${proposal.position_sizing || 'not provided'}`,
    '',
    `FINAL TRANSACTION PROPOSAL: **${proposal.action.toUpperCase()}**`,
  ];
  return parts.join('\n');
}

export function renderPmDecision(decision: PortfolioDecision): string {
  return [
    `**Rating**: ${decision.rating}`,
    '',
    `**Executive Summary**: ${decision.executive_summary}`,
    '',
    `**Investment Thesis**: ${decision.investment_thesis}`,
    '',
    `**Price Target**: ${decision.price_target !== null ? decision.price_target : 'not provided'}`,
    '',
    `**Time Horizon**: ${decision.time_horizon || 'not provided'}`,
  ].join('\n');
}

export function renderPortfolioContext(portfolio: PortfolioContextState, ticker: string): string {
  if (portfolio.mode === 'none') {
    return '';
  }
  const symbol = ticker.trim().toUpperCase();
  const positions = portfolio.mode === 'flat' ? [] : portfolio.positions;
  const held = positions.find((p) => p.ticker.trim().toUpperCase() === symbol);
  const lines: string[] = [];

  if (!held) {
    lines.push(`- No current position in ${symbol}`);
  } else {
    const priceStr =
      held.average_price !== null
        ? `, average price ${held.average_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '';
    lines.push(`- Current position in ${symbol}: ${held.quantity} units${priceStr}`);
  }

  if (portfolio.cash !== null) {
    lines.push(
      `- Cash available: ${portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${portfolio.currency ? ' ' + portfolio.currency : ''}`
    );
  }

  const others = positions.filter((p) => p.ticker.trim().toUpperCase() !== symbol);
  if (others.length > 0) {
    lines.push(`- Other positions: ${others.map((p) => `${p.ticker.toUpperCase()} ${p.quantity}`).join(', ')}`);
  }

  return `Portfolio at the analysis date:\n${lines.join('\n')}`;
}

export function computePortfolioFingerprint(portfolio: PortfolioContextState): string {
  if (portfolio.mode === 'none') return 'none';
  const raw = JSON.stringify({
    mode: portfolio.mode,
    cash: portfolio.cash,
    currency: portfolio.currency,
    positions: portfolio.mode === 'flat' ? [] : portfolio.positions,
  });
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0') + 'a4f9';
}

export const INSTRUMENT_SNAPSHOTS: Record<string, InstrumentSnapshot> = {
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    exchange: 'NASDAQGS',
    currency: 'USD',
    assetType: 'stock',
    sector: 'Semiconductors & AI Infrastructure',
    benchmarkTicker: 'SPY',
    benchmarkName: 'S&P 500 ETF (US)',
    latestClose: 188.4,
    dailyChangePct: 2.34,
    volume: '58.4M',
    marketCap: '$4.59T',
    rsi14: 61.8,
    macd: 3.42,
    macdSignal: 2.65,
    macdHist: 0.77,
    sma50: 176.2,
    sma200: 154.8,
    bollingerUpper: 194.5,
    bollingerLower: 169.1,
    atr14: 5.4,
    peRatio: '41.2x',
    forwardPe: '29.8x',
    revenueGrowthYoY: '+68.4%',
    operatingMargin: '62.7%',
    freeCashFlow: '$74.8B',
    debtToEquity: '0.14',
    secFilingDate: '2026-08-28',
    secFormType: '10-Q (Q2 FY2027 as-filed)',
    stocktwitsCount: 412,
    stocktwitsBullishPct: 74,
    redditMentions: 189,
    redditBullishPct: 68,
    jevDroppedCount: 47,
    polymarketEvent: 'NVIDIA #1 Market Cap Company End of Q4 2026',
    polymarketProb: '64.0%',
    fredFedFunds: '3.75%',
    fredCpiYoY: '2.4%',
    fred10Y: '4.12%',
    priceSeries: [
      { date: '2026-09-25', close: 174.5, benchmarkClose: 612.4 },
      { date: '2026-10-02', close: 178.1, benchmarkClose: 615.0 },
      { date: '2026-10-09', close: 181.6, benchmarkClose: 616.8 },
      { date: '2026-10-16', close: 184.2, benchmarkClose: 618.2 },
      { date: '2026-10-23', close: 188.4, benchmarkClose: 620.5 },
    ],
  },
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    exchange: 'NASDAQGS',
    currency: 'USD',
    assetType: 'stock',
    sector: 'Consumer Hardware & Ecosystem Services',
    benchmarkTicker: 'SPY',
    benchmarkName: 'S&P 500 ETF (US)',
    latestClose: 246.8,
    dailyChangePct: 0.42,
    volume: '39.1M',
    marketCap: '$3.74T',
    rsi14: 52.4,
    macd: 0.85,
    macdSignal: 0.92,
    macdHist: -0.07,
    sma50: 243.1,
    sma200: 228.5,
    bollingerUpper: 253.0,
    bollingerLower: 237.4,
    atr14: 3.6,
    peRatio: '33.6x',
    forwardPe: '28.9x',
    revenueGrowthYoY: '+7.9%',
    operatingMargin: '31.8%',
    freeCashFlow: '$112.4B',
    debtToEquity: '1.38',
    secFilingDate: '2026-08-03',
    secFormType: '10-Q (Q3 FY2026 as-filed)',
    stocktwitsCount: 245,
    stocktwitsBullishPct: 54,
    redditMentions: 112,
    redditBullishPct: 51,
    jevDroppedCount: 29,
    polymarketEvent: 'Apple Services Annual Run-Rate > $115B in 2026',
    polymarketProb: '78.0%',
    fredFedFunds: '3.75%',
    fredCpiYoY: '2.4%',
    fred10Y: '4.12%',
    priceSeries: [
      { date: '2026-09-25', close: 241.0, benchmarkClose: 612.4 },
      { date: '2026-10-02', close: 244.2, benchmarkClose: 615.0 },
      { date: '2026-10-09', close: 242.9, benchmarkClose: 616.8 },
      { date: '2026-10-16', close: 245.5, benchmarkClose: 618.2 },
      { date: '2026-10-23', close: 246.8, benchmarkClose: 620.5 },
    ],
  },
  '0700.HK': {
    ticker: '0700.HK',
    companyName: 'Tencent Holdings Limited',
    exchange: 'HKEX',
    currency: 'HKD',
    assetType: 'stock',
    sector: 'Internet Platforms, Gaming & FinTech',
    benchmarkTicker: '^HSI',
    benchmarkName: 'Hang Seng Index (Hong Kong)',
    latestClose: 458.6,
    dailyChangePct: 1.85,
    volume: '21.8M',
    marketCap: 'HK$4.28T',
    rsi14: 58.9,
    macd: 4.15,
    macdSignal: 3.1,
    macdHist: 1.05,
    sma50: 439.0,
    sma200: 404.2,
    bollingerUpper: 472.0,
    bollingerLower: 428.0,
    atr14: 9.8,
    peRatio: '19.4x',
    forwardPe: '16.2x',
    revenueGrowthYoY: '+11.4%',
    operatingMargin: '34.2%',
    freeCashFlow: 'RMB 198.5B',
    debtToEquity: '0.39',
    secFilingDate: '2026-08-14',
    secFormType: 'HKEX Interim Report (Yahoo Point-in-Time)',
    stocktwitsCount: 98,
    stocktwitsBullishPct: 69,
    redditMentions: 64,
    redditBullishPct: 66,
    jevDroppedCount: 14,
    polymarketEvent: 'PBoC Additional Reserve Requirement Cut in Q4 2026',
    polymarketProb: '71.0%',
    fredFedFunds: '3.75%',
    fredCpiYoY: '2.4%',
    fred10Y: '4.12%',
    priceSeries: [
      { date: '2026-09-25', close: 432.0, benchmarkClose: 20450 },
      { date: '2026-10-02', close: 441.2, benchmarkClose: 20710 },
      { date: '2026-10-09', close: 446.8, benchmarkClose: 20890 },
      { date: '2026-10-16', close: 451.0, benchmarkClose: 21040 },
      { date: '2026-10-23', close: 458.6, benchmarkClose: 21180 },
    ],
  },
  'BTC-USD': {
    ticker: 'BTC-USD',
    companyName: 'Bitcoin / US Dollar Spot',
    exchange: 'CCC',
    currency: 'USD',
    assetType: 'crypto',
    sector: 'Decentralized Digital Asset Layer-1',
    benchmarkTicker: 'BTC-USD',
    benchmarkName: 'Bitcoin Spot Benchmark',
    latestClose: 96420.0,
    dailyChangePct: -1.18,
    volume: '$38.9B',
    marketCap: '$1.91T',
    rsi14: 55.2,
    macd: 1120.0,
    macdSignal: 1290.0,
    macdHist: -170.0,
    sma50: 92850.0,
    sma200: 81400.0,
    bollingerUpper: 101200.0,
    bollingerLower: 89400.0,
    atr14: 2640.0,
    peRatio: 'N/A (Crypto Asset Mode)',
    forwardPe: 'N/A',
    revenueGrowthYoY: 'ETF Net Inflow +$4.1B/30d',
    operatingMargin: 'Hashrate 795 EH/s',
    freeCashFlow: 'Exchange Reserve -3.8% YoY',
    debtToEquity: 'Open Interest $42.6B',
    secFilingDate: '2026-10-23',
    secFormType: 'On-Chain & Spot ETF Flow Snapshot',
    stocktwitsCount: 680,
    stocktwitsBullishPct: 62,
    redditMentions: 410,
    redditBullishPct: 59,
    jevDroppedCount: 118,
    polymarketEvent: 'BTC Crosses $105,000 Before Year-End 2026',
    polymarketProb: '56.0%',
    fredFedFunds: '3.75%',
    fredCpiYoY: '2.4%',
    fred10Y: '4.12%',
    priceSeries: [
      { date: '2026-09-25', close: 91200, benchmarkClose: 91200 },
      { date: '2026-10-02', close: 94100, benchmarkClose: 94100 },
      { date: '2026-10-09', close: 97800, benchmarkClose: 97800 },
      { date: '2026-10-16', close: 97550, benchmarkClose: 97550 },
      { date: '2026-10-23', close: 96420, benchmarkClose: 96420 },
    ],
  },
};

export function getOrBuildInstrumentSnapshot(ticker: string): InstrumentSnapshot {
  const clean = ticker.trim().toUpperCase();
  if (INSTRUMENT_SNAPSHOTS[clean]) {
    return INSTRUMENT_SNAPSHOTS[clean];
  }
  const assetType = detectAssetType(clean);
  const bench = resolveBenchmark(clean);
  return {
    ticker: clean,
    companyName: `${clean} Listed Instrument`,
    exchange: assetType === 'crypto' ? 'CCC' : clean.includes('.') ? clean.split('.')[1] : 'NASDAQ/NYSE',
    currency: clean.endsWith('.HK') ? 'HKD' : clean.endsWith('.T') ? 'JPY' : clean.endsWith('.L') ? 'GBP' : 'USD',
    assetType,
    sector: assetType === 'crypto' ? 'Digital Asset Protocol' : 'Public Equities',
    benchmarkTicker: bench.ticker,
    benchmarkName: bench.name,
    latestClose: 142.5,
    dailyChangePct: 1.12,
    volume: '18.4M',
    marketCap: '$184.0B',
    rsi14: 56.4,
    macd: 1.48,
    macdSignal: 1.12,
    macdHist: 0.36,
    sma50: 136.8,
    sma200: 124.2,
    bollingerUpper: 149.0,
    bollingerLower: 131.5,
    atr14: 3.25,
    peRatio: '24.8x',
    forwardPe: '21.1x',
    revenueGrowthYoY: '+14.2%',
    operatingMargin: '26.4%',
    freeCashFlow: '$9.4B',
    debtToEquity: '0.42',
    secFilingDate: '2026-08-19',
    secFormType: '10-Q Point-in-Time Filing',
    stocktwitsCount: 164,
    stocktwitsBullishPct: 61,
    redditMentions: 84,
    redditBullishPct: 58,
    jevDroppedCount: 21,
    polymarketEvent: 'Federal Reserve 25bps Rate Cut at Next FOMC',
    polymarketProb: '69.0%',
    fredFedFunds: '3.75%',
    fredCpiYoY: '2.4%',
    fred10Y: '4.12%',
    priceSeries: [
      { date: '2026-09-25', close: 135.2, benchmarkClose: 612.4 },
      { date: '2026-10-02', close: 137.8, benchmarkClose: 615.0 },
      { date: '2026-10-09', close: 139.1, benchmarkClose: 616.8 },
      { date: '2026-10-16', close: 140.9, benchmarkClose: 618.2 },
      { date: '2026-10-23', close: 142.5, benchmarkClose: 620.5 },
    ],
  };
}

export const INITIAL_PORTFOLIO: PortfolioContextState = {
  mode: 'active',
  cash: 45000.0,
  currency: 'USD',
  positions: [
    { ticker: 'NVDA', quantity: 120, average_price: 154.5 },
    { ticker: 'AAPL', quantity: 65, average_price: 231.0 },
  ],
};

export const INITIAL_MEMORY_LOG: MemoryLogEntry[] = [
  {
    id: 'mem-1',
    date: '2026-09-18',
    ticker: 'NVDA',
    rating: PortfolioRating.OVERWEIGHT,
    pending: false,
    raw: '+6.4%',
    alpha: '+4.8%',
    holding: '5d',
    resolved: '2026-09-25',
    decision: renderPmDecision({
      rating: PortfolioRating.OVERWEIGHT,
      executive_summary:
        'Accumulate on pullbacks toward the 50-day SMA ($168.40) with a 15% overweight tilt relative to benchmark weight. Maintain a hard risk floor at $159.00 over a 3–6 month horizon.',
      investment_thesis:
        'SEC EDGAR 10-Q filings confirm hyperscaler capex commitments remain supply-constrained through Q1 FY27, while MACD histogram expansion (+0.64) and 72% bullish Jev-screened sentiment support near-term continuation.',
      price_target: 198.0,
      time_horizon: '3-6 months',
    }),
    reflection:
      'The Overweight call captured +4.8% alpha vs SPY over the 5-trading-day settlement window as hyperscaler rack deployment updates validated the Fundamentals Analyst thesis. Sizing discipline held well because existing book exposure was accounted for rather than double-allocated.',
  },
  {
    id: 'mem-2',
    date: '2026-09-29',
    ticker: 'AAPL',
    rating: PortfolioRating.HOLD,
    pending: false,
    raw: '+0.9%',
    alpha: '-0.3%',
    holding: '5d',
    resolved: '2026-10-06',
    decision: renderPmDecision({
      rating: PortfolioRating.HOLD,
      executive_summary:
        'Maintain current 65-unit core holding without deploying additional cash at 33.6x trailing earnings. Re-evaluate upon a breakout above $253.00 or pullback to $236.50.',
      investment_thesis:
        'Services gross margin durability (74.1% in the latest 10-Q) offsets muted hardware unit growth, leaving the bull/bear debate balanced and short-term RSI (52.4) neutral.',
      price_target: 252.0,
      time_horizon: '1-3 months',
    }),
    reflection:
      'AAPL traded within a narrow 1.4% band over the 5-day holding window, trailing SPY by 30 bps. The Hold rating prevented unnecessary turnover in a low-conviction technical setup.',
  },
  {
    id: 'mem-3',
    date: '2026-10-08',
    ticker: '0700.HK',
    rating: PortfolioRating.BUY,
    pending: false,
    raw: '+4.9%',
    alpha: '+2.7%',
    holding: '5d',
    resolved: '2026-10-15',
    decision: renderPmDecision({
      rating: PortfolioRating.BUY,
      executive_summary:
        'Initiate a 5% tactical position at HK$442.00 with a stop-loss at HK$424.00 and a target of HK$485.00 over the next 2–4 months.',
      investment_thesis:
        'Domestic gaming gross receipts accelerated alongside advertising video-account monetization, trading at a discounted 16.2x forward P/E while outperforming the Hang Seng Index (^HSI).',
      price_target: 485.0,
      time_horizon: '2-4 months',
    }),
    reflection:
      'Outperformed the Hang Seng Index (^HSI) by +2.7% over 5 trading days following steady share buyback execution and resilient domestic gaming telemetry.',
  },
  {
    id: 'mem-4',
    date: '2026-10-21',
    ticker: 'NVDA',
    rating: PortfolioRating.BUY,
    pending: true,
    raw: null,
    alpha: null,
    holding: null,
    resolved: null,
    decision: renderPmDecision({
      rating: PortfolioRating.BUY,
      executive_summary:
        'Add 25 units to the existing 120-unit NVDA position at $186.50–$188.40, utilizing $4,700 of the $45,000 available cash buffer with a protective stop at $176.20 (50-day SMA).',
      investment_thesis:
        'All four analyst tracks align constructively: SEC EDGAR 10-Q data shows 62.7% operating margins, RSI-14 at 61.8 leaves room before overbought territory, and Polymarket macro odds point to benign rate conditions.',
      price_target: 212.0,
      time_horizon: '3-6 months',
    }),
    reflection: '',
  },
  {
    id: 'mem-5',
    date: '2026-10-22',
    ticker: 'BTC-USD',
    rating: PortfolioRating.OVERWEIGHT,
    pending: true,
    raw: null,
    alpha: null,
    holding: null,
    resolved: null,
    decision: renderPmDecision({
      rating: PortfolioRating.OVERWEIGHT,
      executive_summary:
        'Allocate 4% of liquid capital on dips toward $94,200 support with an invalidation stop at $89,400 (lower Bollinger Band).',
      investment_thesis:
        'Spot ETF 30-day net inflows (+$4.1B) and declining exchange reserves (-3.8% YoY) outweigh short-term perp funding cools observed by the Sentiment Analyst.',
      price_target: 106500.0,
      time_horizon: '1-3 months',
    }),
    reflection: '',
  },
];

export function getTodayDateStr(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function buildPresetAnalysisRun(
  ticker: string = 'NVDA',
  tradeDate: string = getTodayDateStr(),
  config: RunConfig = DEFAULT_RUN_CONFIG,
  portfolio: PortfolioContextState = INITIAL_PORTFOLIO,
  memoryEntries: MemoryLogEntry[] = INITIAL_MEMORY_LOG,
  customSnapshot?: InstrumentSnapshot,
  lang: 'en' | 'zh-TW' = 'en'
): AnalysisRunState {
  const snap = customSnapshot || getOrBuildInstrumentSnapshot(ticker);
  const isZh = lang === 'zh-TW' || config.output_language === 'Traditional Chinese';
  const portfolioContext = renderPortfolioContext(portfolio, snap.ticker);
  const portfolioFingerprint = computePortfolioFingerprint(portfolio);

  const resolvedSame = memoryEntries.filter(
    (e) => !e.pending && e.ticker === snap.ticker && (!e.resolved || e.resolved <= tradeDate)
  );
  const resolvedCross = memoryEntries.filter(
    (e) => !e.pending && e.ticker !== snap.ticker && (!e.resolved || e.resolved <= tradeDate)
  );

  const pastContextParts: string[] = [];
  if (resolvedSame.length > 0) {
    pastContextParts.push(
      isZh
        ? `${snap.ticker} 的歷史決策紀錄（由新至舊）：`
        : `Past analyses of ${snap.ticker} (most recent first):`
    );
    resolvedSame.forEach((e) => {
      pastContextParts.push(
        `[${e.date} | ${e.ticker} | ${e.rating} | ${e.raw} | ${e.alpha} | ${e.holding}]\nREFLECTION:\n${e.reflection}`
      );
    });
  }
  if (resolvedCross.length > 0) {
    pastContextParts.push(isZh ? '近期跨標的結算反思教訓：' : 'Recent cross-ticker lessons:');
    resolvedCross.slice(0, 2).forEach((e) => {
      pastContextParts.push(`[${e.date} | ${e.ticker} | ${e.rating} | ${e.raw}]\n${e.reflection}`);
    });
  }

  const isBullish = snap.rsi14 >= 55 && snap.macdHist >= 0;
  const sentimentBand = isBullish ? SentimentBand.BULLISH : SentimentBand.MILDLY_BULLISH;
  const sentimentScore = isBullish ? 7.6 : 6.1;

  const sentimentStructured: SentimentReport = {
    overall_band: sentimentBand,
    overall_score: sentimentScore,
    confidence: 'high',
    narrative: isZh
      ? [
          `### 1. 各社群與新聞來源明細`,
          `- **StockTwits 即時串流（經 Jev 篩選後分析 ${snap.stocktwitsCount} 則貼文；已剔除 ${snap.jevDroppedCount} 則無關噪音）：** ${snap.stocktwitsBullishPct}% 看多、${100 - snap.stocktwitsBullishPct - 11}% 看空、11% 中立。機構資金追蹤顯示 ${snap.currency} ${(snap.latestClose * 1.05).toFixed(0)} 履約價附近買權價差部位持續累積。`,
          `- **Reddit 投資討論板（跨 r/investing 與 r/securityanalysis 共 ${snap.redditMentions} 則討論串）：** ${snap.redditBullishPct}% 偏向正面，討論重心集中於毛利率韌性與資本回報紀律。`,
          `- **Yahoo Finance 與財經外電：** 報導聚焦於訂單能見度與穩健的自由現金流轉換率（${snap.freeCashFlow}）。`,
          ``,
          `### 2. 跨來源分歧與主導議題`,
          `StockTwits 短線交易者聚焦於突破 ${snap.currency} ${snap.bollingerUpper.toFixed(2)} 布林通道上軌，而長線基本面投資人則關注若 10 年期美債殖利率（目前 ${snap.fred10Y}）攀升可能帶來的估值收縮風險。`,
          ``,
          `| 情緒來源 | Jev 篩選樣本 | 看多比例 | 核心催化劑 | 訊號方向 |`,
          `| :--- | :--- | :--- | :--- | :--- |`,
          `| StockTwits (Jev v1.13) | ${snap.stocktwitsCount} 則貼文 | ${snap.stocktwitsBullishPct}% | 機構選擇權資金流向 | 看多 (Bullish) |`,
          `| Reddit 投資社群 | ${snap.redditMentions} 則討論 | ${snap.redditBullishPct}% | 營業利益率與護城河 | 溫和看多 (Mildly Bullish) |`,
          `| 財經新聞外電 | 20 篇報導 | 70% | 產能與資本支出能見度 | 看多 (Bullish) |`,
        ].join('\n')
      : [
          `### 1. Source-by-Source Breakdown`,
          `- **StockTwits Stream (${snap.stocktwitsCount} messages analyzed after Jev screening; ${snap.jevDroppedCount} off-topic posts dropped):** ${snap.stocktwitsBullishPct}% bullish stance, ${100 - snap.stocktwitsBullishPct - 11}% bearish, 11% neutral. Institutional flow trackers highlight sustained call-spread accumulation around the ${snap.currency} ${(snap.latestClose * 1.05).toFixed(0)} strike.`,
          `- **Reddit Subreddits (${snap.redditMentions} threads across r/investing & r/securityanalysis):** ${snap.redditBullishPct}% constructive sentiment focusing on gross-margin durability and capital return discipline rather than retail meme momentum.`,
          `- **Yahoo Finance & Wire Headlines:** Coverage centers on institutional order book visibility through H1 2027 and resilient free cash flow conversion (${snap.freeCashFlow}).`,
          ``,
          `### 2. Cross-Source Divergences & Dominant Themes`,
          `Retail commentary on StockTwits is focused on near-term breakout levels above ${snap.currency} ${snap.bollingerUpper.toFixed(2)}, whereas longer-horizon Reddit discussions emphasize valuation multiple compression risk if 10-Year Treasury yields (${snap.fred10Y}) move above 4.35%.`,
          ``,
          `| Signal Source | Screened Sample | Bullish Ratio | Dominant Catalyst | Signal Direction |`,
          `| :--- | :--- | :--- | :--- | :--- |`,
          `| StockTwits (Jev v1.13) | ${snap.stocktwitsCount} posts | ${snap.stocktwitsBullishPct}% | Institutional options flow | Bullish |`,
          `| Reddit Communities | ${snap.redditMentions} threads | ${snap.redditBullishPct}% | Operating margin resilience | Mildly Bullish |`,
          `| Financial News Wires | 20 articles | 70% | Backlog & capex visibility | Bullish |`,
        ].join('\n'),
  };

  const isAboveSma50 = snap.latestClose > snap.sma50;
  const pctVsSma50 = (((snap.latestClose - snap.sma50) / snap.sma50) * 100).toFixed(1);
  const protectiveStop = Number(
    (snap.sma50 < snap.latestClose * 0.99 && snap.sma50 > snap.latestClose * 0.85
      ? snap.sma50
      : snap.bollingerLower < snap.latestClose * 0.99 && snap.bollingerLower > snap.latestClose * 0.85
      ? snap.bollingerLower
      : Math.min(snap.latestClose * 0.955, snap.latestClose - Math.max(snap.atr14 * 2, snap.latestClose * 0.03))
    ).toFixed(2)
  );
  const stopLabelZh =
    protectiveStop === Number(snap.sma50.toFixed(2))
      ? `50 日均線支撐 ${snap.currency} ${protectiveStop.toFixed(2)}`
      : protectiveStop === Number(snap.bollingerLower.toFixed(2))
      ? `布林通道下軌支撐 ${snap.currency} ${protectiveStop.toFixed(2)}`
      : `2 倍 ATR 波動率保護位 ${snap.currency} ${protectiveStop.toFixed(2)}`;
  const stopLabelEn =
    protectiveStop === Number(snap.sma50.toFixed(2))
      ? `50-day SMA support (${snap.currency} ${protectiveStop.toFixed(2)})`
      : protectiveStop === Number(snap.bollingerLower.toFixed(2))
      ? `lower Bollinger support (${snap.currency} ${protectiveStop.toFixed(2)})`
      : `2x ATR volatility stop (${snap.currency} ${protectiveStop.toFixed(2)})`;

  const marketReport = isZh
    ? [
        `### 市場價格與技術指標驗證快照 (${tradeDate})`,
        `基於 Yahoo Finance 截至 **${tradeDate}** 之歷史日 K 線數據（標的：**${snap.companyName} (${snap.ticker})**，交易所：**${snap.exchange}**）：`,
        ``,
        `| 技術指標 | 驗證數值 | 技術型態解讀 |`,
        `| :--- | :--- | :--- |`,
        `| 最新收盤價 | ${snap.currency} ${snap.latestClose.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${snap.dailyChangePct >= 0 ? '+' : ''}${snap.dailyChangePct}%) | ${isAboveSma50 ? `股價位於 50 日均線之上 +${pctVsSma50}%` : `股價回測 50 日均線下方 (${pctVsSma50}%)，下檔支撐看 ${protectiveStop.toFixed(2)}`} |`,
        `| 50 日 / 200 日均線 (SMA) | ${snap.sma50.toFixed(2)} / ${snap.sma200.toFixed(2)} | ${snap.sma50 >= snap.sma200 ? '中長期均線呈黃金交叉多頭排列' : '均線處於區間整理階段'} |`,
        `| RSI (14 日相對強弱) | ${snap.rsi14.toFixed(1)} | ${snap.rsi14 > 65 ? '動能偏強並接近高檔區' : snap.rsi14 < 40 ? '短線進入超賣支撐區，具反彈契機' : '動能穩健且未出現超買背離'} |`,
        `| MACD (12, 26, 9) | DIF ${snap.macd.toFixed(2)} / DEA ${snap.macdSignal.toFixed(2)} (柱狀 ${snap.macdHist >= 0 ? '+' : ''}${snap.macdHist.toFixed(2)}) | ${snap.macdHist >= 0 ? '多方動能柱持續擴張' : '前波上攻後進行整理蓄勢'} |`,
        `| 布林通道 (20, 2) | 上軌 ${snap.bollingerUpper.toFixed(2)} / 下軌 ${snap.bollingerLower.toFixed(2)} | ATR(14) 日均真實波幅為 ${snap.atr14.toFixed(2)} |`,
        ``,
        `### 關鍵支撐與壓力價位`,
        `- **下方關鍵支撐（停損參考）：** ${stopLabelZh}。`,
        `- **上方主要壓力：** ${!isAboveSma50 ? `50 日均線 ${snap.currency} ${snap.sma50.toFixed(2)} 與 ` : ''}布林通道上軌 ${snap.currency} ${snap.bollingerUpper.toFixed(2)}；若帶量突破，波段目標上看 ${snap.currency} ${(snap.latestClose * 1.11).toFixed(2)}。`,
      ].join('\n')
    : [
        `### Verified Market & Technical Snapshot (${tradeDate})`,
        `Grounded in deterministic Yahoo Finance OHLCV bars through **${tradeDate}** for **${snap.companyName} (${snap.ticker})** on **${snap.exchange}**:`,
        ``,
        `| Indicator | Verified Value | Regime Interpretation |`,
        `| :--- | :--- | :--- |`,
        `| Latest Close | ${snap.currency} ${snap.latestClose.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${snap.dailyChangePct >= 0 ? '+' : ''}${snap.dailyChangePct}%) | ${isAboveSma50 ? `Trading +${pctVsSma50}% above 50-day SMA` : `Trading ${pctVsSma50}% below 50-day SMA; downside support at ${protectiveStop.toFixed(2)}`} |`,
        `| 50-Day / 200-Day SMA | ${snap.sma50.toFixed(2)} / ${snap.sma200.toFixed(2)} | ${snap.sma50 >= snap.sma200 ? 'Golden cross alignment intact; primary trend constructive' : 'Moving averages in consolidation phase'} |`,
        `| RSI (14-Day) | ${snap.rsi14.toFixed(1)} | ${snap.rsi14 > 65 ? 'Approaching upper momentum band' : snap.rsi14 < 40 ? 'Approaching oversold support zone' : 'Constructive momentum without overbought exhaustion'} |`,
        `| MACD (12, 26, 9) | Line ${snap.macd.toFixed(2)} / Signal ${snap.macdSignal.toFixed(2)} (Hist ${snap.macdHist >= 0 ? '+' : ''}${snap.macdHist.toFixed(2)}) | ${snap.macdHist >= 0 ? 'Positive momentum divergence' : 'Consolidating after prior impulse'} |`,
        `| Bollinger Bands (20, 2) | Upper ${snap.bollingerUpper.toFixed(2)} / Lower ${snap.bollingerLower.toFixed(2)} | ATR(14) daily volatility at ${snap.atr14.toFixed(2)} |`,
        ``,
        `### Technical Structure & Key Price Levels`,
        `- **Immediate Downside Support (Stop Reference):** ${stopLabelEn}.`,
        `- **Overhead Resistance:** ${!isAboveSma50 ? `50-day SMA (${snap.currency} ${snap.sma50.toFixed(2)}) and ` : ''}${snap.currency} ${snap.bollingerUpper.toFixed(2)} (upper Bollinger boundary); a daily close above opens a measured move toward ${snap.currency} ${(snap.latestClose * 1.11).toFixed(2)}.`,
      ].join('\n');

  const newsReport = isZh
    ? [
        `### 公司動態與全球宏觀新聞綜合分析（截至 ${tradeDate}）`,
        `- **產業與公司新聞焦點：** 截至 ${tradeDate} 之機構法人報告與供應鏈追蹤顯示 **${snap.companyName}** 終端需求與定價能力維持強勁，年增率達 **${snap.revenueGrowthYoY}**。`,
        `- **FRED 宏觀經濟指標：** 聯邦基金利率（Fed Funds）為 **${snap.fredFedFunds}**、核心 CPI 年增率為 **${snap.fredCpiYoY}**、10 年期美債殖利率為 **${snap.fred10Y}**。實質利率維持穩定，有利於科技與成長股估值。`,
        `- **Polymarket 預測市場即時定價：** 預測合約 *"${snap.polymarketEvent}"* 目前市場隱含機率為 **${snap.polymarketProb}**，反映真金白銀訂單簿對後續催化劑之共識預期。`,
        `- **區域基準指數對照：** 本次分析將以 **${snap.benchmarkTicker} (${snap.benchmarkName})** 作為未來 ${config.holding_period_days} 個交易日結算超額報酬（Alpha）之比較基準。`,
      ].join('\n')
    : [
        `### Company & Global Macro News Synthesis (Window ending ${tradeDate})`,
        `- **Sector & Company Headlines:** Recent institutional filings and supply-chain checks as of ${tradeDate} indicate sustained enterprise demand and pricing power for **${snap.companyName}**, with revenue growth tracking at **${snap.revenueGrowthYoY}** YoY.`,
        `- **FRED Macroeconomic Backdrop:** Federal Funds Rate stands at **${snap.fredFedFunds}**, Headline CPI YoY at **${snap.fredCpiYoY}**, and the 10-Year US Treasury yield at **${snap.fred10Y}**. Real rates remain stable, supporting duration equity multiples.`,
        `- **Polymarket Prediction Market Pricing:** Contract *"${snap.polymarketEvent}"* implies a **${snap.polymarketProb}** probability on liquid order books, confirming consensus institutional expectations.`,
        `- **Regional Benchmark Context:** Evaluated against **${snap.benchmarkTicker} (${snap.benchmarkName})** over a ${config.holding_period_days}-trading-day forward settlement window.`,
      ].join('\n');

  const fundamentalsReport =
    snap.assetType === 'crypto'
      ? isZh
        ? [
            `### 加密資產模式：鏈上數據與資金流向基本面 (${tradeDate})`,
            `基本面分析師於 **crypto** 模式下略過傳統公司損益表，改為評估鏈上流動性與現貨 ETF 資金流：`,
            `- **現貨 ETF 淨流入：** ${snap.revenueGrowthYoY}`,
            `- **網路算力與安全性：** ${snap.operatingMargin}`,
            `- **交易所儲備變化：** ${snap.freeCashFlow}`,
            `- **衍生品未平倉結構：** ${snap.debtToEquity}`,
          ].join('\n')
        : [
            `### Crypto Asset Mode Network & Flow Fundamentals (${tradeDate})`,
            `Fundamentals Analyst bypassed corporate income statements in **crypto** asset mode and evaluated on-chain liquidity and ETF flow telemetry:`,
            `- **Spot ETF Net Flow:** ${snap.revenueGrowthYoY}`,
            `- **Network Security & Hashrate:** ${snap.operatingMargin}`,
            `- **Exchange Reserve Dynamics:** ${snap.freeCashFlow}`,
            `- **Derivatives Structure:** ${snap.debtToEquity}`,
          ].join('\n')
      : isZh
      ? [
          `### SEC EDGAR / 官方原始申報財報分析 (${snap.secFormType})`,
          `嚴格依據 **${snap.secFilingDate}** 當下已申報之財務數據（排除 ${tradeDate} 之後的重編或未來資訊）：`,
          ``,
          `| 財務指標 | 原始申報數值 | 財務品質與同業評估 |`,
          `| :--- | :--- | :--- |`,
          `| 本益比（歷史 / 預估 P/E） | ${snap.peRatio} / ${snap.forwardPe} | 預估本益比獲強勁盈餘上修支撐 |`,
          `| 營收年增率 (YoY) | ${snap.revenueGrowthYoY} | 於 ${snap.sector} 領域位居前段班成長 |`,
          `| 營業利益率 (Op Margin) | ${snap.operatingMargin} | 展現優異營運槓桿與產品定價護城河 |`,
          `| 自由現金流 (TTM FCF) | ${snap.freeCashFlow} | 現金轉換率極高，足以支應研發與庫藏股回購 |`,
          `| 負債權益比 (D/E) | ${snap.debtToEquity} | 資產負債表穩健，流動性充裕 |`,
          ``,
          `### 財務品質查核`,
          `於 ${snap.secFilingDate} 申報之財報中未發現應收帳款異常或資本化扭曲；營業現金流持續高於稅後淨利，確認盈餘品質優良。`,
        ].join('\n')
      : [
          `### Point-in-Time As-Filed Financial Statements (${snap.secFormType})`,
          `Served strictly as filed on **${snap.secFilingDate}** (no look-ahead restatements after ${tradeDate}):`,
          ``,
          `| Metric | As-Filed Figure | Quality & Peer Assessment |`,
          `| :--- | :--- | :--- |`,
          `| Valuation (Trailing / Forward P/E) | ${snap.peRatio} / ${snap.forwardPe} | Forward multiple supported by earnings revisions |`,
          `| YoY Revenue Growth | ${snap.revenueGrowthYoY} | Top-decile top-line expansion in ${snap.sector} |`,
          `| Operating Margin | ${snap.operatingMargin} | Exceptional operating leverage and pricing moat |`,
          `| Free Cash Flow (TTM) | ${snap.freeCashFlow} | High cash conversion funding R&D and buybacks |`,
          `| Debt-to-Equity Ratio | ${snap.debtToEquity} | Conservative balance sheet with ample liquidity |`,
          ``,
          `### Fundamental Audit`,
          `No accounting red flags or working-capital distortions were detected in the ${snap.secFilingDate} filing. Cash flow from operations exceeds net income, confirming high earnings quality.`,
        ].join('\n');

  const bullHistory = isZh
    ? [
        `**多方研究員 (Bull Researcher - 第 1 輪)：** 綜合已驗證之財報基本面（營收成長 ${snap.revenueGrowthYoY}、營業利益率 ${snap.operatingMargin}）與技術支撐結構（收盤價 ${snap.latestClose.toFixed(2)}，下檔具備 ${stopLabelZh} 保護），目前具備高度不對稱的上檔獲利空間。Jev 過濾後的情緒分數（${sentimentScore.toFixed(1)}/10）亦印證機構法人正持續吸籌。`,
        `**多方研究員 (Bull Researcher - 第 2 輪)：** 回應估值疑慮：考量高達 ${snap.freeCashFlow} 的自由現金流與穩定的 10 年期殖利率（${snap.fred10Y}），目前預估本益比 ${snap.forwardPe} 仍具吸引力。若過度等待深幅回檔，將錯失上看 ${(snap.latestClose * 1.12).toFixed(2)} 的主升段行情。`,
      ].join('\n\n')
    : [
        `**Bull Researcher (Round 1):** The convergence of verified fundamentals (${snap.revenueGrowthYoY} top-line growth, ${snap.operatingMargin} operating margin) and technical support structure (price ${snap.latestClose.toFixed(2)} backed by ${stopLabelEn}) creates an asymmetric upside setup. Jev-screened sentiment (${sentimentScore.toFixed(1)}/10) confirms institutional accumulation rather than retail euphoria.`,
        `**Bull Researcher (Round 2):** Addressing valuation concerns: a forward multiple of ${snap.forwardPe} is well below historical peak-cycle norms given ${snap.freeCashFlow} in trailing free cash flow and stable ${snap.fred10Y} 10-year yields. Waiting for a deep pullback risks missing the primary institutional re-rating toward ${(snap.latestClose * 1.12).toFixed(2)}.`,
      ].join('\n\n');

  const bearHistory = isZh
    ? [
        `**空方研究員 (Bear Researcher - 第 1 輪)：** 儘管歷史財報亮眼，但 ${snap.ticker} 目前歷史本益比達 ${snap.peRatio}，且 StockTwits 看多比例高達 ${snap.stocktwitsBullishPct}%，顯示利多題材已大幅反映於股價中。若宏觀殖利率突破 ${snap.fred10Y}，估值可能面臨修正壓力。`,
        `**空方研究員 (Bear Researcher - 第 2 輪)：** 此外，14 日真實波幅 ATR(14) 達 ${snap.atr14.toFixed(2)}，代表日內波動劇烈。若在 ${snap.latestClose.toFixed(2)} 附近追高重倉，一旦跌破下檔支撐（${protectiveStop.toFixed(2)}），將對比基準指數 ${snap.benchmarkTicker} 產生不必要的短期回撤。`,
      ].join('\n\n')
    : [
        `**Bear Researcher (Round 1):** While trailing execution is strong, ${snap.ticker} trades at ${snap.peRatio} trailing earnings with ${snap.stocktwitsBullishPct}% bullish consensus on StockTwits—a contrarian indicator that positive catalysts are already priced in. Any macro uptick in the 10-Year yield above ${snap.fred10Y} could compress multiples.`,
        `**Bear Researcher (Round 2):** Furthermore, ATR(14) of ${snap.atr14.toFixed(2)} implies elevated daily volatility. If we add aggressively near ${snap.latestClose.toFixed(2)}, a breakdown below support (${protectiveStop.toFixed(2)}) would create avoidable drawdown against our ${snap.benchmarkTicker} benchmark.`,
      ].join('\n\n');

  const recRating = isBullish ? PortfolioRating.BUY : PortfolioRating.OVERWEIGHT;
  const researchPlanStructured: ResearchPlan = {
    recommendation: recRating,
    rationale: isZh
      ? `多方研究員憑藉 ${snap.secFilingDate} 申報之實質財報數據（營業利益率 ${snap.operatingMargin}、自由現金流 ${snap.freeCashFlow}）以及明確的下檔保護位（${stopLabelZh}）勝出。空方提出的波動率提醒應透過嚴格停損價位來控管，而非消極觀望（Hold）。`
      : `The Bull Researcher carried the debate with hard point-in-time evidence from the ${snap.secFilingDate} filing (${snap.operatingMargin} operating margin, ${snap.freeCashFlow} FCF) and defined downside support at ${stopLabelEn}. The Bear Researcher's volatility caution warrants disciplined stop-loss placement rather than sitting in Hold.`,
    strategic_actions: isZh
      ? `建議執行分批 ${recRating} 布局，以 ${snap.currency} ${snap.latestClose.toFixed(2)} 為基準，於盤中回測 ${snap.currency} ${(snap.latestClose * 0.985).toFixed(2)} 時逢低承接，並將嚴格停損點設於進場價下方的 ${stopLabelZh}，波段目標價上看 ${snap.currency} ${(snap.latestClose * 1.12).toFixed(2)}。`
      : `Execute a staged ${recRating} allocation anchored near ${snap.currency} ${snap.latestClose.toFixed(2)}, scaling in on intraday tests toward ${snap.currency} ${(snap.latestClose * 0.985).toFixed(2)} with a strict protective stop-loss below entry at ${stopLabelEn} and an upside objective of ${snap.currency} ${(snap.latestClose * 1.12).toFixed(2)}.`,
  };

  const traderProposalStructured: TraderProposal = {
    action: TraderAction.BUY,
    reasoning: isZh
      ? `依據研究總監之 ${recRating} 投資計畫與市場分析師驗證之最新收盤價 ${snap.currency} ${snap.latestClose.toFixed(2)}，做多（Buy）部位之停損必須設於進場價下方；將停損設於 ${stopLabelZh} 可提供約 2.8:1 的優良風報比。`
      : `Anchored in the Research Manager's ${recRating} plan and the Market Analyst's verified close of ${snap.currency} ${snap.latestClose.toFixed(2)}, risk-reward is favorable at a 2.8:1 ratio when placing the long invalidation stop below entry at ${stopLabelEn}.`,
    entry_price: Number(snap.latestClose.toFixed(2)),
    stop_loss: protectiveStop,
    position_sizing:
      portfolio.mode === 'active'
        ? isZh
          ? '動用可用現金之 10%（於現有持倉基礎上溫和加碼）'
          : '10% of available cash ($4,500 incremental addition to existing book)'
        : isZh
        ? '占總投資組合資金之 6%'
        : '6% of total portfolio capital',
  };

  const aggressiveHistory = isZh
    ? `**激進派風控分析師 (Aggressive Debater)：** 鑑於基本面強勁且 Polymarket 對核心催化劑給出 ${snap.polymarketProb} 的高機率定價，建議立即於現價 ${snap.currency} ${snap.latestClose.toFixed(2)} 全額建倉，以捕捉超越 ${snap.benchmarkTicker} 的波段行情。`
    : `**Aggressive Debater:** With strong fundamentals and Polymarket pricing ${snap.polymarketProb} odds on the key catalyst, we should deploy the full allocation immediately at market (${snap.currency} ${snap.latestClose.toFixed(2)}) to capture upside alpha vs ${snap.benchmarkTicker}.`;
  const conservativeHistory = isZh
    ? `**保守派風控分析師 (Conservative Debater)：** 考量 ATR(14) 波幅達 ${snap.atr14.toFixed(2)}，應嚴格限制單次加碼不超過可用現金之 10%，並將進場價下方的 ${stopLabelZh} 設為強制停損線以保護既有帳面資本。`
    : `**Conservative Debater:** Respect the Bear Researcher's volatility warning (ATR ${snap.atr14.toFixed(2)}). Limit incremental sizing to 10% of free cash and enforce a hard stop-loss below entry at ${stopLabelEn} to protect capital.`;
  const neutralHistory = isZh
    ? `**中立派風控分析師 (Neutral Debater)：** 折衷雙方觀點，建議採兩階段進場：60% 部位於現價（${snap.currency} ${snap.latestClose.toFixed(2)}）成交，40% 掛單於 ${snap.currency} ${(snap.latestClose * 0.98).toFixed(2)} 承接，兼顧參與度與下檔保護。`
    : `**Neutral Debater:** Balance both views by entering two tranches: 60% at current close (${snap.currency} ${snap.latestClose.toFixed(2)}) and 40% on a limit order at ${snap.currency} ${(snap.latestClose * 0.98).toFixed(2)}, keeping portfolio concentration within risk limits.`;

  const pmDecisionStructured: PortfolioDecision = {
    rating: recRating,
    executive_summary: isZh
      ? `核定 ${snap.ticker} 最終評級為 **${recRating}**，參考進場價位 ${snap.currency} ${snap.latestClose.toFixed(2)}，保護性停損設於進場價下方的 ${snap.currency} ${protectiveStop.toFixed(2)}，3–6 個月目標價為 ${snap.currency} ${(snap.latestClose * 1.12).toFixed(2)}。${
          portfolio.mode === 'active'
            ? `考量目前帳本已有 ${portfolio.positions.length} 檔持倉與 ${portfolio.currency} ${portfolio.cash?.toLocaleString() ?? 0} 現金，本次加碼規模控制在可用現金之 10%。`
            : '建議配置標準 6% 核心權重。'
        }`
      : `Commit to a ${recRating} rating on ${snap.ticker} with an entry reference at ${snap.currency} ${snap.latestClose.toFixed(2)}, protective stop-loss below entry at ${snap.currency} ${protectiveStop.toFixed(2)}, and price target of ${snap.currency} ${(snap.latestClose * 1.12).toFixed(2)} over a 3–6 month horizon. ${
          portfolio.mode === 'active'
            ? `Account for the standing portfolio book (${portfolio.positions.length} active positions, ${portfolio.currency} ${portfolio.cash?.toLocaleString() ?? 0} cash) by sizing the addition at 10% of free cash.`
            : 'Size at a standard 6% core weight.'
        }`,
    investment_thesis: isZh
      ? `綜合截至 ${snap.secFilingDate} 之強勁財報基本面（營收年增 ${snap.revenueGrowthYoY}、自由現金流 ${snap.freeCashFlow}）、明確的技術支撐結構（下檔停損設於 ${protectiveStop.toFixed(2)}），以及 ${sentimentScore.toFixed(1)}/10 的正面情緒評分，多方論據明顯優於短期估值疑慮。對照記憶日誌中 ${snap.ticker} 的歷史經驗，嚴守下檔停損分批布局能穩定創造優於基準指數 ${snap.benchmarkTicker} 的超額報酬（Alpha）。`
      : `Point-in-time fundamental strength (${snap.revenueGrowthYoY} growth, ${snap.freeCashFlow} FCF as of ${snap.secFilingDate}), well-defined technical risk levels (protective stop at ${protectiveStop.toFixed(2)}), and ${sentimentScore.toFixed(1)}/10 Jev-screened sentiment outweigh near-term multiple expansion concerns. Prior memory-log lessons for ${snap.ticker} confirm that sizing additions incrementally with strict downside stops consistently generates positive alpha against ${snap.benchmarkTicker}.`,
    price_target: Number((snap.latestClose * 1.12).toFixed(2)),
    time_horizon: isZh ? '3-6 個月' : '3-6 months',
  };

  return {
    runId: `run-${snap.ticker.toLowerCase()}-${tradeDate}`,
    company_of_interest: snap.ticker,
    trade_date: tradeDate,
    asset_type: snap.assetType,
    selected_analysts: ['market', 'social', 'news', 'fundamentals'],
    instrument_context: `${snap.companyName} (${snap.ticker}) · Exchange: ${snap.exchange} · Currency: ${snap.currency} · Asset Type: ${snap.assetType} · Benchmark: ${snap.benchmarkTicker}`,
    portfolio_context: portfolioContext,
    portfolio_fingerprint: portfolioFingerprint,
    past_context: pastContextParts.join('\n\n'),
    memory_note: '',
    market_report: marketReport,
    sentiment_report: renderSentimentReport(sentimentStructured),
    sentiment_structured: sentimentStructured,
    news_report: newsReport,
    fundamentals_report: fundamentalsReport,
    investment_debate_state: {
      bull_history: bullHistory,
      bear_history: bearHistory,
      history: `${bullHistory}\n\n${bearHistory}`,
      current_response: bullHistory,
    },
    investment_plan: renderResearchPlan(researchPlanStructured),
    research_plan_structured: researchPlanStructured,
    trader_investment_plan: renderTraderProposal(traderProposalStructured),
    trader_proposal_structured: traderProposalStructured,
    risk_debate_state: {
      aggressive_history: aggressiveHistory,
      conservative_history: conservativeHistory,
      neutral_history: neutralHistory,
      history: `${aggressiveHistory}\n\n${conservativeHistory}\n\n${neutralHistory}`,
    },
    final_trade_decision: renderPmDecision(pmDecisionStructured),
    pm_decision_structured: pmDecisionStructured,
    final_rating: recRating,
    run_settings: {
      version: '0.7.0',
      llm_provider: config.llm_provider,
      deep_think_provider: config.deep_think_provider || config.llm_provider,
      deep_think_llm: config.deep_think_llm,
      quick_think_provider: config.quick_think_provider || config.llm_provider,
      quick_think_llm: config.quick_think_llm,
      analysts: ['market', 'social', 'news', 'fundamentals'],
      max_debate_rounds: config.max_debate_rounds,
      max_risk_discuss_rounds: config.max_risk_discuss_rounds,
      output_language: config.output_language,
      data_vendors: config.data_vendors,
      resumed_from_checkpoint: false,
    },
    analyst_wall_times: {
      market: 1.42,
      social: 1.88,
      news: 1.65,
      fundamentals: 1.54,
    },
    stats: {
      llm_calls: 11,
      tool_calls: 8,
      tokens_in: 18420,
      tokens_out: 4890,
      elapsed_seconds: 6.4,
    },
    tool_calls: [
      {
        id: 'tc-1',
        timestamp: '09:30:01',
        agent: 'Market Analyst',
        toolName: 'get_stock_data',
        args: `ticker="${snap.ticker}", end_date="${tradeDate}", lookback_days=60`,
        vendor: config.data_vendors.core_stock_apis,
        durationMs: 320,
      },
      {
        id: 'tc-2',
        timestamp: '09:30:01',
        agent: 'Market Analyst',
        toolName: 'get_technical_indicators',
        args: `ticker="${snap.ticker}", indicators=["rsi_14","macd","boll","sma_50","sma_200","atr_14"]`,
        vendor: config.data_vendors.technical_indicators,
        durationMs: 280,
      },
      {
        id: 'tc-3',
        timestamp: '09:30:02',
        agent: 'Sentiment Analyst',
        toolName: 'get_social_sentiment',
        args: `ticker="${snap.ticker}", sources=["stocktwits","reddit"], jev_screen=${config.jev_Repeat_screening}`,
        vendor: 'stocktwits,reddit',
        durationMs: 610,
      },
      {
        id: 'tc-4',
        timestamp: '09:30:02',
        agent: 'News Analyst',
        toolName: 'get_company_news',
        args: `ticker="${snap.ticker}", as_of="${tradeDate}", limit=20`,
        vendor: config.data_vendors.news_data,
        durationMs: 410,
      },
      {
        id: 'tc-5',
        timestamp: '09:30:02',
        agent: 'News Analyst',
        toolName: 'get_macro_fred_series',
        args: `series=["FEDFUNDS","CPIAUCSL","DGS10"], as_of="${tradeDate}"`,
        vendor: config.data_vendors.macro_data,
        durationMs: 290,
      },
      {
        id: 'tc-6',
        timestamp: '09:30:03',
        agent: 'News Analyst',
        toolName: 'get_polymarket_contracts',
        args: `query="${snap.ticker}", as_of="${tradeDate}"`,
        vendor: config.data_vendors.prediction_markets,
        durationMs: 340,
      },
      {
        id: 'tc-7',
        timestamp: '09:30:03',
        agent: 'Fundamentals Analyst',
        toolName: 'get_as_filed_statements',
        args: `ticker="${snap.ticker}", as_of="${tradeDate}", forms=["10-K","10-Q"]`,
        vendor: config.data_vendors.fundamental_data,
        durationMs: 520,
      },
      {
        id: 'tc-8',
        timestamp: '09:30:04',
        agent: 'Memory Node',
        toolName: 'settle_pending_and_load_lessons',
        args: `ticker="${snap.ticker}", as_of="${tradeDate}", holding_period_days=${config.holding_period_days}`,
        vendor: 'trading_memory.md',
        durationMs: 190,
      },
    ],
    messages: [
      {
        id: 'm-1',
        timestamp: '09:30:01',
        type: 'System',
        agent: 'Orchestrator',
        content: `Resolved instrument identity: ${snap.companyName} (${snap.ticker}) on ${snap.exchange}. Parallel analyst execution started.`,
      },
      {
        id: 'm-2',
        timestamp: '09:30:02',
        type: 'Data',
        agent: 'Market Analyst',
        content: `Verified close ${snap.currency} ${snap.latestClose.toFixed(2)}, RSI(14)=${snap.rsi14.toFixed(1)}, MACD Hist=${snap.macdHist.toFixed(2)}, SMA50=${snap.sma50.toFixed(2)}.`,
      },
      {
        id: 'm-3',
        timestamp: '09:30:03',
        type: 'Data',
        agent: 'Fundamentals Analyst',
        content: `Point-in-time filing (${snap.secFormType}, filed ${snap.secFilingDate}): Rev Growth ${snap.revenueGrowthYoY}, Op Margin ${snap.operatingMargin}, FCF ${snap.freeCashFlow}.`,
      },
      {
        id: 'm-4',
        timestamp: '09:30:03',
        type: 'Data',
        agent: 'Sentiment Analyst',
        content: `Screened ${snap.stocktwitsCount + snap.redditMentions} social posts (Jev dropped ${snap.jevDroppedCount} noise posts). Overall Band: ${sentimentBand} (${sentimentScore.toFixed(1)}/10).`,
      },
      {
        id: 'm-5',
        timestamp: '09:30:04',
        type: 'Agent',
        agent: 'Bull Researcher',
        content: `Opened bullish thesis anchored in ${snap.operatingMargin} operating margins and golden-cross support at ${snap.sma50.toFixed(2)}.`,
      },
      {
        id: 'm-6',
        timestamp: '09:30:05',
        type: 'Agent',
        agent: 'Bear Researcher',
        content: `Countered with valuation sensitivity at ${snap.peRatio} P/E and ATR(14) volatility of ${snap.atr14.toFixed(2)}.`,
      },
      {
        id: 'm-7',
        timestamp: '09:30:05',
        type: 'Agent',
        agent: 'Research Manager',
        content: `Synthesized ${config.max_debate_rounds}-round debate into structured ResearchPlan: Recommendation = ${recRating}.`,
      },
      {
        id: 'm-8',
        timestamp: '09:30:06',
        type: 'Agent',
        agent: 'Trader',
        content: `Filed FINAL TRANSACTION PROPOSAL: **BUY** at ${snap.latestClose.toFixed(2)} with stop-loss at ${snap.sma50.toFixed(2)}.`,
      },
      {
        id: 'm-9',
        timestamp: '09:30:06',
        type: 'Agent',
        agent: 'Portfolio Manager',
        content: `Finalized PortfolioDecision (${recRating}) with target ${snap.currency} ${(snap.latestClose * 1.12).toFixed(2)} and recorded decision to memory log.`,
      },
    ],
  };
}

export const INITIAL_BACKTEST_SUMMARY: BacktestSummary = {
  run_id: 'bt_202610_grid_7d',
  resolved: 10,
  pending: 2,
  unscored: 0,
  holding: '5 trading days',
  by_rating: {
    Buy: { count: 4, hit_rate: 0.75, mean_alpha: 0.0315 },
    Overweight: { count: 3, hit_rate: 0.6667, mean_alpha: 0.0192 },
    Hold: { count: 2, hit_rate: null, mean_alpha: -0.0015 },
    Underweight: { count: 1, hit_rate: 1.0, mean_alpha: -0.021 },
  },
  cells: [
    {
      ticker: 'NVDA',
      date: '2026-09-10',
      resolutionDate: '2026-09-17',
      rating: PortfolioRating.BUY,
      entryPrice: 164.2,
      exitPrice: 171.8,
      rawReturnPct: 4.63,
      benchmarkTicker: 'SPY',
      benchmarkReturnPct: 1.12,
      alphaPct: 3.51,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Strong datacenter backlog and MACD crossover drove +3.51% alpha over SPY.',
    },
    {
      ticker: 'NVDA',
      date: '2026-09-17',
      resolutionDate: '2026-09-24',
      rating: PortfolioRating.OVERWEIGHT,
      entryPrice: 171.8,
      exitPrice: 176.9,
      rawReturnPct: 2.97,
      benchmarkTicker: 'SPY',
      benchmarkReturnPct: 0.85,
      alphaPct: 2.12,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Continued momentum above 50-day SMA; outpaced benchmark by +212 bps.',
    },
    {
      ticker: 'NVDA',
      date: '2026-09-24',
      resolutionDate: '2026-10-01',
      rating: PortfolioRating.BUY,
      entryPrice: 176.9,
      exitPrice: 184.5,
      rawReturnPct: 4.3,
      benchmarkTicker: 'SPY',
      benchmarkReturnPct: 0.74,
      alphaPct: 3.56,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Supply chain verification and bullish options flow confirmed upside.',
    },
    {
      ticker: 'AAPL',
      date: '2026-09-10',
      resolutionDate: '2026-09-17',
      rating: PortfolioRating.HOLD,
      entryPrice: 238.4,
      exitPrice: 240.1,
      rawReturnPct: 0.71,
      benchmarkTicker: 'SPY',
      benchmarkReturnPct: 1.12,
      alphaPct: -0.41,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Balanced hardware/services debate resulted in Hold; traded inline with market.',
    },
    {
      ticker: 'AAPL',
      date: '2026-09-17',
      resolutionDate: '2026-09-24',
      rating: PortfolioRating.OVERWEIGHT,
      entryPrice: 240.1,
      exitPrice: 245.2,
      rawReturnPct: 2.12,
      benchmarkTicker: 'SPY',
      benchmarkReturnPct: 0.85,
      alphaPct: 1.27,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Services margin expansion in 10-Q drove +1.27% benchmark outperformance.',
    },
    {
      ticker: 'AAPL',
      date: '2026-09-24',
      resolutionDate: '2026-10-01',
      rating: PortfolioRating.UNDERWEIGHT,
      entryPrice: 245.2,
      exitPrice: 241.8,
      rawReturnPct: -1.39,
      benchmarkTicker: 'SPY',
      benchmarkReturnPct: 0.71,
      alphaPct: -2.1,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Short-term RSI exhaustion near upper Bollinger Band correctly flagged pullback.',
    },
    {
      ticker: '0700.HK',
      date: '2026-09-10',
      resolutionDate: '2026-09-17',
      rating: PortfolioRating.BUY,
      entryPrice: 418.0,
      exitPrice: 436.4,
      rawReturnPct: 4.4,
      benchmarkTicker: '^HSI',
      benchmarkReturnPct: 1.35,
      alphaPct: 3.05,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Gaming gross receipts beat and share buybacks outpaced Hang Seng Index.',
    },
    {
      ticker: '0700.HK',
      date: '2026-09-17',
      resolutionDate: '2026-09-24',
      rating: PortfolioRating.OVERWEIGHT,
      entryPrice: 436.4,
      exitPrice: 448.0,
      rawReturnPct: 2.66,
      benchmarkTicker: '^HSI',
      benchmarkReturnPct: 0.29,
      alphaPct: 2.37,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Video Accounts ad load expansion supported +2.37% regional alpha.',
    },
    {
      ticker: '0700.HK',
      date: '2026-09-24',
      resolutionDate: '2026-10-01',
      rating: PortfolioRating.BUY,
      entryPrice: 448.0,
      exitPrice: 446.2,
      rawReturnPct: -0.4,
      benchmarkTicker: '^HSI',
      benchmarkReturnPct: 0.08,
      alphaPct: -0.48,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Consolidation after multi-week rally; minor -48 bps lag vs ^HSI.',
    },
    {
      ticker: 'AAPL',
      date: '2026-10-01',
      resolutionDate: '2026-10-08',
      rating: PortfolioRating.HOLD,
      entryPrice: 241.8,
      exitPrice: 243.9,
      rawReturnPct: 0.87,
      benchmarkTicker: 'SPY',
      benchmarkReturnPct: 0.76,
      alphaPct: 0.11,
      holdingDays: 5,
      status: 'resolved',
      summary: 'Neutral consolidation around 50-day SMA.',
    },
    {
      ticker: 'NVDA',
      date: '2026-10-21',
      resolutionDate: '2026-10-28',
      rating: PortfolioRating.BUY,
      entryPrice: 186.9,
      exitPrice: 188.4,
      rawReturnPct: 0.8,
      benchmarkTicker: 'SPY',
      benchmarkReturnPct: 0.25,
      alphaPct: 0.55,
      holdingDays: 5,
      status: 'pending',
      summary: 'Holding window in progress (settles after 5 trading closes).',
    },
    {
      ticker: '0700.HK',
      date: '2026-10-21',
      resolutionDate: '2026-10-28',
      rating: PortfolioRating.OVERWEIGHT,
      entryPrice: 454.0,
      exitPrice: 458.6,
      rawReturnPct: 1.01,
      benchmarkTicker: '^HSI',
      benchmarkReturnPct: 0.4,
      alphaPct: 0.61,
      holdingDays: 5,
      status: 'pending',
      summary: 'Holding window in progress (settles after 5 trading closes).',
    },
  ],
};
