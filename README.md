# TradingAgents — Multi-Agent LLM Financial Trading Framework (React + Express)

TradingAgents is a multi-agent financial trading research web application rewritten in **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Express (`server.ts`)** powered by the `@google/genai` SDK (`gemini-3.8-flash`).

## Core Features

1. **Analysis Desk (Interactive Run Configuration & Live Multi-Agent Graph Execution)**
   - Configure ticker symbols across global markets (`NVDA`, `AAPL`, `0700.HK`, `BTC-USD`, or custom symbols) with automatic asset-type detection (`stock` vs `crypto`) and regional benchmark mapping (`SPY`, `^HSI`, `^N225`, `^FTSE`, `BTC-USD`).
   - Point-in-time analysis date enforcement (prevents future dates and look-ahead bias).
   - Selectable Analyst Team (`Market Analyst`, `Sentiment Analyst`, `News Analyst`, `Fundamentals Analyst`) running in parallel with wall-time tracking.
   - Configurable Quick-Think and Deep-Think LLM provider tiers, debate rounds, data vendor chains, TypeSafe Jev social post screening, and LangGraph checkpoint state management.
   - Live execution progress, tool call traces (`get_stock_data`, `get_technical_indicators`, `get_as_filed_statements`, `get_social_sentiment`, `get_macro_fred_series`, `get_polymarket_contracts`), and structured agent report tabs.

2. **Complete Report Viewer & Standalone HTML Exporter**
   - Unified institutional report view covering all five pipeline stages (`I. Analyst Team Reports`, `II. Research Team Decision`, `III. Trading Team Plan`, `IV. Risk Management Team Decision`, `V. Portfolio Management Decision`).
   - One-click export of self-contained `complete_report.html` and `full_states_log.json`.

3. **Standing Portfolio Book (`PortfolioContext`)**
   - Supports three distinct states: **Standing Positions Book**, **Explicit Flat Book (0 positions)**, and **No Portfolio Context**.
   - Full CRUD for positions (long/short signed quantities and average entry prices), free cash, currency selection, JSON import/export (`my_book.json`), and live `portfolio.render()` + SHA-256 checkpoint fingerprint preview.

4. **Backtest Grid Evaluator**
   - Sweep across a `(tickers × dates)` grid (`iter_grid` and `run_backtest`).
   - Scores decisions by realized alpha against each instrument's regional benchmark from the first close after the analysis date, grouped by 5-tier `PortfolioRating` (`Buy`, `Overweight`, `Hold`, `Underweight`, `Sell`).

5. **Persistent Decision & Reflection Memory Log (`trading_memory.md`)**
   - Append-only record of past trading decisions and post-settlement reflections.
   - Includes **Settle Pending Decisions** (`settle_all_pending`) to resolve pending runs against benchmark alpha and generate post-trade reflection lessons injected into future Portfolio Manager runs.

## Development

```bash
npm install
npm run dev
```

The development server listens on `http://0.0.0.0:3000`.
