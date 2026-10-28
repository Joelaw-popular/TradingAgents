import React, { useState } from 'react';
import { PortfolioContextState, PortfolioMode, Position } from '../types/trading';
import { computePortfolioFingerprint, renderPortfolioContext } from '../data/presets';
import { UI_TEXT, UILanguage } from '../utils/i18n';
import { Plus, Trash2, Download, Upload, Briefcase } from 'lucide-react';

interface PortfolioBookViewProps {
  lang: UILanguage;
  portfolio: PortfolioContextState;
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioContextState>>;
  activeTicker: string;
}

export const PortfolioBookView: React.FC<PortfolioBookViewProps> = ({
  lang,
  portfolio,
  setPortfolio,
  activeTicker,
}) => {
  const t = UI_TEXT[lang].portfolio;
  const [newTicker, setNewTicker] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newAvgPrice, setNewAvgPrice] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleModeChange = (mode: PortfolioMode) => {
    setPortfolio((prev) => ({ ...prev, mode }));
  };

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newTicker.trim().toUpperCase();
    const qty = parseFloat(newQty);
    const avg = newAvgPrice.trim() ? parseFloat(newAvgPrice) : null;
    if (!sym || isNaN(qty) || qty === 0) return;

    setPortfolio((prev) => {
      const existingIdx = prev.positions.findIndex((p) => p.ticker.toUpperCase() === sym);
      const nextPositions = [...prev.positions];
      const item: Position = {
        ticker: sym,
        quantity: qty,
        average_price: avg !== null && !isNaN(avg) ? avg : null,
      };
      if (existingIdx >= 0) {
        nextPositions[existingIdx] = item;
      } else {
        nextPositions.push(item);
      }
      return {
        ...prev,
        mode: 'active',
        positions: nextPositions,
      };
    });

    setNewTicker('');
    setNewQty('');
    setNewAvgPrice('');
  };

  const handleDeletePosition = (sym: string) => {
    setPortfolio((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p.ticker.toUpperCase() !== sym.toUpperCase()),
    }));
  };

  const handleExportBookJson = () => {
    const payload = {
      cash: portfolio.cash,
      currency: portfolio.currency,
      positions: portfolio.mode === 'flat' ? [] : portfolio.positions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_book.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const positions: Position[] = Array.isArray(parsed.positions)
          ? parsed.positions.map((p: Position) => ({
              ticker: String(p.ticker || '').toUpperCase(),
              quantity: Number(p.quantity || 0),
              average_price: p.average_price != null ? Number(p.average_price) : null,
            }))
          : [];
        setPortfolio({
          mode: positions.length === 0 ? 'flat' : 'active',
          cash: parsed.cash != null ? Number(parsed.cash) : null,
          currency: String(parsed.currency || 'USD'),
          positions,
        });
        setJsonError(null);
      } catch (err) {
        setJsonError(`Invalid portfolio JSON: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const renderedBlock = renderPortfolioContext(portfolio, activeTicker);
  const fingerprint = computePortfolioFingerprint(portfolio);

  return (
    <div className="space-y-6">
      {/* Header & Three-State Portfolio Context Selector */}
      <section className="bg-white border border-[#E2E5E8] rounded-md p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E5E8]">
          <div>
            <h2 className="text-lg font-semibold text-[#1C2126] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#087A59]" />
              {t.title}
            </h2>
            <p className="text-xs text-[#5D6670] mt-0.5">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportBookJson}
              className="px-3 py-1.5 text-xs font-medium text-[#1C2126] bg-[#F2F4F5] hover:bg-[#E2E5E8] rounded flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {t.exportJson}
            </button>
            <label className="px-3 py-1.5 text-xs font-medium text-[#1C2126] bg-white border border-[#D3D8DC] hover:bg-[#F2F4F5] rounded flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {t.importJson}
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {jsonError && <p className="mt-3 text-xs text-[#B4372F]">{jsonError}</p>}

        {/* Three Distinct States from tradingagents/portfolio.py */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              mode: 'active' as PortfolioMode,
              title: t.mode1Title,
              desc: t.mode1Desc,
            },
            {
              mode: 'flat' as PortfolioMode,
              title: t.mode2Title,
              desc: t.mode2Desc,
            },
            {
              mode: 'none' as PortfolioMode,
              title: t.mode3Title,
              desc: t.mode3Desc,
            },
          ].map((item) => (
            <button
              key={item.mode}
              type="button"
              onClick={() => handleModeChange(item.mode)}
              className={`text-left p-3.5 rounded border transition-colors cursor-pointer ${
                portfolio.mode === item.mode
                  ? 'bg-[#087A59]/6 border-[#087A59]'
                  : 'bg-[#FBFBFA] border-[#E2E5E8] hover:border-[#D3D8DC]'
              }`}
            >
              <div className="text-xs font-semibold text-[#1C2126]">{item.title}</div>
              <p className="text-[11px] text-[#5D6670] mt-1 leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 cols: Cash & Positions Table */}
        <div className="lg:col-span-7 bg-white border border-[#E2E5E8] rounded-md p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#E2E5E8]">
            <div>
              <label className="block text-xs font-medium text-[#5D6670] mb-1">{t.freeCash}</label>
              <input
                type="number"
                value={portfolio.cash ?? ''}
                onChange={(e) =>
                  setPortfolio((p) => ({
                    ...p,
                    cash: e.target.value === '' ? null : parseFloat(e.target.value),
                  }))
                }
                placeholder="e.g. 45000"
                className="w-full px-3 py-2 text-sm font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5D6670] mb-1">{t.currency}</label>
              <select
                value={portfolio.currency}
                onChange={(e) => setPortfolio((p) => ({ ...p, currency: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
              >
                <option value="USD">USD — US Dollar</option>
                <option value="HKD">HKD — Hong Kong Dollar</option>
                <option value="JPY">JPY — Japanese Yen</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>

          {/* Add Position Form */}
          <form onSubmit={handleAddPosition} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
            <div>
              <label className="block text-[11px] text-[#5D6670] mb-1">{t.ticker}</label>
              <input
                type="text"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                placeholder="e.g. MSFT"
                className="w-full px-2.5 py-1.5 text-xs font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#5D6670] mb-1">{t.qty}</label>
              <input
                type="number"
                step="any"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-2.5 py-1.5 text-xs font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#5D6670] mb-1">{t.avgPrice}</label>
              <input
                type="number"
                step="any"
                value={newAvgPrice}
                onChange={(e) => setNewAvgPrice(e.target.value)}
                placeholder="e.g. 415.00"
                className="w-full px-2.5 py-1.5 text-xs font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#087A59] hover:bg-[#066347] rounded flex items-center justify-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.addUpdate}
            </button>
          </form>

          {/* Positions Table */}
          <div className="border border-[#E2E5E8] rounded overflow-hidden">
            <table className="w-full text-left border-collapse text-xs font-mono-tabular">
              <thead>
                <tr className="bg-[#F2F4F5] border-b border-[#D3D8DC] text-[#1C2126]">
                  <th className="py-2.5 px-3 font-semibold">{t.instrument}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t.signedUnits}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t.avgEntry}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t.costBasis}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5E8]">
                {portfolio.positions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#5D6670] font-sans">
                      {t.emptyPositions}
                    </td>
                  </tr>
                ) : (
                  portfolio.positions.map((pos) => (
                    <tr key={pos.ticker} className="hover:bg-[#FBFBFA]">
                      <td className="py-2.5 px-3 font-semibold text-[#1C2126]">{pos.ticker}</td>
                      <td
                        className={`py-2.5 px-3 text-right font-medium ${
                          pos.quantity >= 0 ? 'text-[#087A59]' : 'text-[#B4372F]'
                        }`}
                      >
                        {pos.quantity >= 0 ? `+${pos.quantity}` : pos.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#1C2126]">
                        {pos.average_price !== null
                          ? `${portfolio.currency} ${pos.average_price.toFixed(2)}`
                          : 'not provided'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#5D6670]">
                        {pos.average_price !== null
                          ? `${portfolio.currency} ${(Math.abs(pos.quantity) * pos.average_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeletePosition(pos.ticker)}
                          className="text-[#5D6670] hover:text-[#B4372F] p-1 cursor-pointer"
                          title="Remove position"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 5 cols: Live Prompt Injection Preview & Checkpoint Fingerprint */}
        <div className="lg:col-span-5 bg-white border border-[#E2E5E8] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1C2126]">
              {t.previewTitle} (`portfolio.render(&quot;{activeTicker}&quot;)`)
            </h3>
            <span className="text-[11px] font-mono-tabular text-[#5D6670]">
              sha256: {fingerprint}
            </span>
          </div>

          <p className="text-xs text-[#5D6670]">
            {t.previewDesc} <strong className="text-[#1C2126]">{activeTicker}</strong>:
          </p>

          <pre className="p-4 bg-[#F2F4F5] border border-[#E2E5E8] rounded text-xs font-mono-tabular text-[#1C2126] whitespace-pre-wrap leading-relaxed min-h-[120px]">
            {renderedBlock || '(Empty string — No portfolio context injected)'}
          </pre>

          <div className="pt-2 border-t border-[#E2E5E8] text-[11px] text-[#5D6670] leading-relaxed">
            {t.checkpointNote}
          </div>
        </div>
      </div>
    </div>
  );
};
