import React, { useState } from 'react';
import { BacktestSummary } from '../types/trading';
import { getTodayDateStr } from '../data/presets';
import { UI_TEXT, UILanguage } from '../utils/i18n';
import { Play, Grid, CheckCircle2, Clock } from 'lucide-react';

interface BacktestGridViewProps {
  lang: UILanguage;
  summary: BacktestSummary;
  onRunSweep: (params: {
    tickers: string[];
    startDate: string;
    endDate: string;
    everyNDays: number;
    holdingDays: number;
  }) => Promise<void>;
  isSweeping: boolean;
}

export const BacktestGridView: React.FC<BacktestGridViewProps> = ({
  lang,
  summary,
  onRunSweep,
  isSweeping,
}) => {
  const t = UI_TEXT[lang].backtest;
  const todayStr = getTodayDateStr();
  const [tickersInput, setTickersInput] = useState('NVDA, AAPL, 0700.HK');
  const [startDate, setStartDate] = useState('2026-09-10');
  const [endDate, setEndDate] = useState(todayStr);
  const [everyNDays, setEveryNDays] = useState(7);
  const [holdingDays] = useState(5);
  const [filterRating, setFilterRating] = useState<string>('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const list = tickersInput
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (list.length === 0) return;
    onRunSweep({
      tickers: list,
      startDate,
      endDate,
      everyNDays,
      holdingDays,
    });
  };

  const filteredCells =
    filterRating === 'ALL'
      ? summary.cells
      : summary.cells.filter((c) => c.rating === filterRating);

  const ratingOrder = ['Buy', 'Overweight', 'Hold', 'Underweight', 'Sell'];

  return (
    <div className="space-y-6">
      {/* Grid Configuration Form */}
      <section className="bg-white border border-[#E2E5E8] rounded-md p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E5E8]">
          <div>
            <h2 className="text-lg font-semibold text-[#1C2126] flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#087A59]" />
              {t.title}
            </h2>
            <p className="text-xs text-[#5D6670] mt-0.5">{t.subtitle}</p>
          </div>
          <span className="text-xs font-mono-tabular text-[#5D6670]">
            Run ID: {summary.run_id}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-[#5D6670] mb-1">
              {t.tickersLabel}
            </label>
            <input
              type="text"
              value={tickersInput}
              onChange={(e) => setTickersInput(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5D6670] mb-1">{t.startDate}</label>
            <input
              type="date"
              value={startDate}
              max={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5D6670] mb-1">{t.endDate}</label>
            <input
              type="date"
              value={endDate}
              max={todayStr}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5D6670] mb-1">{t.stepDays}</label>
            <input
              type="number"
              min={1}
              max={30}
              value={everyNDays}
              onChange={(e) => setEveryNDays(Math.max(1, parseInt(e.target.value, 10) || 7))}
              className="w-full px-3 py-2 text-xs font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
            />
          </div>
          <button
            type="submit"
            disabled={isSweeping}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#087A59] hover:bg-[#066347] disabled:opacity-50 rounded flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isSweeping ? t.sweeping : t.runSweep}
          </button>
        </form>
      </section>

      {/* Rating Score Summary Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white border border-[#E2E5E8] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
            <h3 className="text-sm font-semibold text-[#1C2126]">{t.scoreByRating}</h3>
            <span className="text-xs font-mono-tabular text-[#5D6670]">
              {t.resolved}: {summary.resolved} · {t.pending}: {summary.pending}
            </span>
          </div>

          <div className="border border-[#E2E5E8] rounded overflow-hidden">
            <table className="w-full text-left border-collapse text-xs font-mono-tabular">
              <thead>
                <tr className="bg-[#F2F4F5] border-b border-[#D3D8DC] text-[#1C2126]">
                  <th className="py-2 px-3 font-semibold">{t.rating}</th>
                  <th className="py-2 px-3 font-semibold text-right">{t.cells}</th>
                  <th className="py-2 px-3 font-semibold text-right">{t.hitRate}</th>
                  <th className="py-2 px-3 font-semibold text-right">{t.meanAlpha}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5E8]">
                {ratingOrder
                  .filter((r) => summary.by_rating[r])
                  .map((r) => {
                    const sc = summary.by_rating[r];
                    const isPositive = sc.mean_alpha >= 0;
                    return (
                      <tr key={r} className="hover:bg-[#FBFBFA]">
                        <td className="py-2.5 px-3 font-semibold text-[#1C2126]">{r}</td>
                        <td className="py-2.5 px-3 text-right">{sc.count}</td>
                        <td className="py-2.5 px-3 text-right text-[#5D6670]">
                          {sc.hit_rate !== null
                            ? `${(sc.hit_rate * 100).toFixed(0)}%`
                            : t.noDirection}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-semibold ${
                            isPositive ? 'text-[#087A59]' : 'text-[#B4372F]'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {(sc.mean_alpha * 100).toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-[#5D6670] leading-relaxed">
            {t.alphaNote} <strong className="text-[#1C2126]">{summary.holding}</strong>{' '}
            {t.alphaNote2}
          </p>
        </div>

        {/* Right 7 cols: Individual Grid Cells Audit Table */}
        <div className="lg:col-span-7 bg-white border border-[#E2E5E8] rounded-md p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E5E8]">
            <h3 className="text-sm font-semibold text-[#1C2126]">
              {t.gridOutcomes} ({filteredCells.length})
            </h3>
            <div className="flex items-center gap-1 bg-[#F2F4F5] p-1 rounded">
              {['ALL', 'Buy', 'Overweight', 'Hold', 'Underweight'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterRating(f)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filterRating === f
                      ? 'bg-white text-[#1C2126] shadow-xs'
                      : 'text-[#5D6670] hover:text-[#1C2126]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-[#E2E5E8] rounded overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono-tabular">
              <thead>
                <tr className="bg-[#F2F4F5] border-b border-[#D3D8DC] text-[#1C2126]">
                  <th className="py-2 px-3 font-semibold">{t.cellCol}</th>
                  <th className="py-2 px-3 font-semibold">{t.rating}</th>
                  <th className="py-2 px-3 font-semibold text-right">{t.rawReturn}</th>
                  <th className="py-2 px-3 font-semibold text-right">{t.benchmarkCol}</th>
                  <th className="py-2 px-3 font-semibold text-right">Alpha ({holdingDays}d)</th>
                  <th className="py-2 px-3 font-semibold text-right">{t.statusCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5E8]">
                {filteredCells.map((cell, idx) => (
                  <tr key={`${cell.ticker}-${cell.date}-${idx}`} className="hover:bg-[#FBFBFA]">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#1C2126]">
                        {cell.ticker} · {cell.date}
                      </div>
                      <div className="text-[11px] text-[#5D6670] font-sans truncate max-w-xs">
                        {cell.summary}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#1C2126]">{cell.rating}</td>
                    <td
                      className={`py-2.5 px-3 text-right ${
                        cell.rawReturnPct >= 0 ? 'text-[#087A59]' : 'text-[#B4372F]'
                      }`}
                    >
                      {cell.rawReturnPct >= 0 ? '+' : ''}
                      {cell.rawReturnPct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#5D6670]">
                      {cell.benchmarkTicker} ({cell.benchmarkReturnPct >= 0 ? '+' : ''}
                      {cell.benchmarkReturnPct.toFixed(2)}%)
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-semibold ${
                        cell.alphaPct >= 0 ? 'text-[#087A59]' : 'text-[#B4372F]'
                      }`}
                    >
                      {cell.alphaPct >= 0 ? '+' : ''}
                      {cell.alphaPct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {cell.status === 'resolved' ? (
                        <span className="text-[#087A59] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          resolved
                        </span>
                      ) : (
                        <span className="text-[#D97706] inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
