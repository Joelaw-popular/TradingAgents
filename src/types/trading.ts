export enum PortfolioRating {
  BUY = 'Buy',
  OVERWEIGHT = 'Overweight',
  HOLD = 'Hold',
  UNDERWEIGHT = 'Underweight',
  SELL = 'Sell',
}

export enum TraderAction {
  BUY = 'Buy',
  HOLD = 'Hold',
  SELL = 'Sell',
}

export enum SentimentBand {
  BULLISH = 'Bullish',
  MILDLY_BULLISH = 'Mildly Bullish',
  NEUTRAL = 'Neutral',
  MIXED = 'Mixed',
  MILDLY_BEARISH = 'Mildly Bearish',
  BEARISH = 'Bearish',
}

export type AnalystKey = 'market' | 'social' | 'news' | 'fundamentals';

export type AssetType = 'stock' | 'crypto';

export type AgentStatusValue = 'pending' | 'in_progress' | 'completed' | 'error';

export interface SentimentReport {
  overall_band: SentimentBand;
  overall_score: number;
  confidence: 'low' | 'medium' | 'high';
  narrative: string;
}

export interface ResearchPlan {
  recommendation: PortfolioRating;
  rationale: string;
  strategic_actions: string;
}

export interface TraderProposal {
  action: TraderAction;
  reasoning: string;
  entry_price: number | null;
  stop_loss: number | null;
  position_sizing: string | null;
}

export interface PortfolioDecision {
  rating: PortfolioRating;
  executive_summary: string;
  investment_thesis: string;
  price_target: number | null;
  time_horizon: string | null;
}

export interface DataVendorsConfig {
  core_stock_apis: string;
  technical_indicators: string;
  fundamental_data: string;
  news_data: string;
  macro_data: string;
  prediction_markets: string;
}

export interface RunConfig {
  llm_provider: string;
  quick_think_provider: string | null;
  quick_think_llm: string;
  deep_think_provider: string | null;
  deep_think_llm: string;
  max_debate_rounds: number;
  max_risk_discuss_rounds: number;
  max_tool_rounds: number;
  temperature: number | null;
  output_language: string;
  checkpoint_enabled: boolean;
  holding_period_days: number;
  benchmark_ticker: string | null;
  jev_Repeat_screening: boolean;
  reasoning_effort: string | null;
  data_vendors: DataVendorsConfig;
}

export interface Position {
  ticker: string;
  quantity: number;
  average_price: number | null;
}

export type PortfolioMode = 'active' | 'flat' | 'none';

export interface PortfolioContextState {
  mode: PortfolioMode;
  cash: number | null;
  currency: string;
  positions: Position[];
}

export interface ToolCallEvent {
  id: string;
  timestamp: string;
  agent: string;
  toolName: string;
  args: string;
  vendor: string;
  durationMs: number;
}

export interface AgentMessageEvent {
  id: string;
  timestamp: string;
  type: 'Agent' | 'Data' | 'Tool' | 'Control' | 'System';
  agent: string;
  content: string;
}

export interface InstrumentSnapshot {
  ticker: string;
  companyName: string;
  exchange: string;
  currency: string;
  assetType: AssetType;
  sector: string;
  benchmarkTicker: string;
  benchmarkName: string;
  latestClose: number;
  dailyChangePct: number;
  volume: string;
  marketCap: string;
  rsi14: number;
  macd: number;
  macdSignal: number;
  macdHist: number;
  sma50: number;
  sma200: number;
  bollingerUpper: number;
  bollingerLower: number;
  atr14: number;
  peRatio: string;
  forwardPe: string;
  revenueGrowthYoY: string;
  operatingMargin: string;
  freeCashFlow: string;
  debtToEquity: string;
  secFilingDate: string;
  secFormType: string;
  stocktwitsCount: number;
  stocktwitsBullishPct: number;
  redditMentions: number;
  redditBullishPct: number;
  jevDroppedCount: number;
  polymarketEvent: string;
  polymarketProb: string;
  fredFedFunds: string;
  fredCpiYoY: string;
  fred10Y: string;
  priceSeries: { date: string; close: number; benchmarkClose: number }[];
  liveSources?: {
    yahoo: boolean;
    secEdgar: boolean;
    polymarket: boolean;
    fetchedAt: string;
  };
}

export interface AnalysisRunState {
  runId: string;
  company_of_interest: string;
  trade_date: string;
  asset_type: AssetType;
  selected_analysts: AnalystKey[];
  instrument_context: string;
  portfolio_context: string;
  portfolio_fingerprint: string;
  past_context: string;
  memory_note: string;
  market_report: string;
  sentiment_report: string;
  sentiment_structured?: SentimentReport;
  news_report: string;
  fundamentals_report: string;
  investment_debate_state: {
    bull_history: string;
    bear_history: string;
    history: string;
    current_response: string;
  };
  investment_plan: string;
  research_plan_structured?: ResearchPlan;
  trader_investment_plan: string;
  trader_proposal_structured?: TraderProposal;
  risk_debate_state: {
    aggressive_history: string;
    conservative_history: string;
    neutral_history: string;
    history: string;
  };
  final_trade_decision: string;
  pm_decision_structured?: PortfolioDecision;
  final_rating: PortfolioRating | 'REVIEW';
  run_settings: {
    version: string;
    llm_provider: string;
    deep_think_provider: string;
    deep_think_llm: string;
    quick_think_provider: string;
    quick_think_llm: string;
    analysts: AnalystKey[];
    max_debate_rounds: number;
    max_risk_discuss_rounds: number;
    output_language: string;
    data_vendors: DataVendorsConfig;
    resumed_from_checkpoint?: boolean;
  };
  analyst_wall_times: Partial<Record<AnalystKey, number>>;
  stats: {
    llm_calls: number;
    tool_calls: number;
    tokens_in: number;
    tokens_out: number;
    elapsed_seconds: number;
  };
  tool_calls: ToolCallEvent[];
  messages: AgentMessageEvent[];
}

export interface MemoryLogEntry {
  id: string;
  date: string;
  ticker: string;
  rating: PortfolioRating | 'REVIEW';
  pending: boolean;
  raw: string | null;
  alpha: string | null;
  holding: string | null;
  resolved: string | null;
  decision: string;
  reflection: string;
}

export interface BacktestCellResult {
  ticker: string;
  date: string;
  resolutionDate: string;
  rating: PortfolioRating | 'REVIEW';
  entryPrice: number;
  exitPrice: number;
  rawReturnPct: number;
  benchmarkTicker: string;
  benchmarkReturnPct: number;
  alphaPct: number;
  holdingDays: number;
  status: 'resolved' | 'pending';
  summary: string;
}

export interface RatingScore {
  count: number;
  hit_rate: number | null;
  mean_alpha: number;
}

export interface BacktestSummary {
  run_id: string;
  resolved: number;
  pending: number;
  unscored: number;
  holding: string;
  by_rating: Record<string, RatingScore>;
  cells: BacktestCellResult[];
}
