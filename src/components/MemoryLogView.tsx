import React, { useState } from 'react';
import { MemoryLogEntry } from '../types/trading';
import { getTodayDateStr } from '../data/presets';
import { UI_TEXT, UILanguage } from '../utils/i18n';
import { MarkdownBlock } from './MarkdownBlock';
import { BookOpen, CheckCircle2, Clock, Download, Sparkles } from 'lucide-react';

interface MemoryLogViewProps {
  lang: UILanguage;
  entries: MemoryLogEntry[];
  onSettlePending: () => Promise<void>;
  isSettling: boolean;
}

export const MemoryLogView: React.FC<MemoryLogViewProps> = ({
  lang,
  entries,
  onSettlePending,
  isSettling,
}) => {
  const t = UI_TEXT[lang].memory;
  const todayStr = getTodayDateStr();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [tickerQuery, setTickerQuery] = useState('');
  const [asOfCutoff, setAsOfCutoff] = useState(() => getTodayDateStr());

  const pendingCount = entries.filter((e) => e.pending).length;

  const filtered = entries.filter((e) => {
    if (statusFilter === 'pending' && !e.pending) return false;
    if (statusFilter === 'resolved' && e.pending) return false;
    if (tickerQuery.trim() && !e.ticker.toUpperCase().includes(tickerQuery.trim().toUpperCase())) {
      return false;
    }
    if (!e.pending && e.resolved && e.resolved > asOfCutoff) {
      return false;
    }
    return true;
  });

  const handleExportMarkdown = () => {
    const separator = '\n\n<!-- ENTRY_END -->\n\n';
    const blocks = entries.map((e) => {
      const tag = e.pending
        ? `[${e.date} | ${e.ticker} | ${e.rating} | pending]`
        : `[${e.date} | ${e.ticker} | ${e.rating} | ${e.raw} | ${e.alpha} | ${e.holding}${
            e.resolved ? ` | resolved:${e.resolved}` : ''
          }]`;
      return e.reflection
        ? `${tag}\n\nDECISION:\n${e.decision}\n\nREFLECTION:\n${e.reflection}`
        : `${tag}\n\nDECISION:\n${e.decision}`;
    });
    const blob = new Blob([blocks.join(separator) + separator], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading_memory.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Settlement Controls */}
      <section className="bg-white border border-[#E2E5E8] rounded-md p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E5E8]">
          <div>
            <h2 className="text-lg font-semibold text-[#1C2126] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#087A59]" />
              {t.title}
            </h2>
            <p className="text-xs text-[#5D6670] mt-0.5">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="px-3 py-2 text-xs font-medium text-[#1C2126] bg-[#F2F4F5] hover:bg-[#E2E5E8] rounded flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {t.exportMd}
            </button>
            <button
              type="button"
              disabled={isSettling || pendingCount === 0}
              onClick={onSettlePending}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#087A59] hover:bg-[#066347] disabled:opacity-50 rounded flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isSettling ? t.settling : `${t.settleBtn} (${pendingCount})`}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-[#F2F4F5] p-1 rounded">
            {[
              { id: 'all', label: `${t.allEntries} (${entries.length})` },
              { id: 'resolved', label: `${t.resolvedTab} (${entries.length - pendingCount})` },
              { id: 'pending', label: `${t.pendingTab} (${pendingCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-[#1C2126] shadow-xs'
                    : 'text-[#5D6670] hover:text-[#1C2126]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#5D6670]">{t.filterTicker}</span>
              <input
                type="text"
                value={tickerQuery}
                onChange={(e) => setTickerQuery(e.target.value)}
                placeholder="e.g. NVDA"
                className="w-28 px-2.5 py-1 text-xs font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#5D6670]">{t.asOfCutoff}</span>
              <input
                type="date"
                value={asOfCutoff}
                max={todayStr}
                onChange={(e) => setAsOfCutoff(e.target.value)}
                className="px-2.5 py-1 text-xs font-mono-tabular bg-[#FBFBFA] border border-[#D3D8DC] rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Entries List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E2E5E8] rounded-md p-8 text-center text-sm text-[#5D6670]">
            {t.emptyFilter}
          </div>
        ) : (
          filtered.map((entry) => {
            const tag = entry.pending
              ? `[${entry.date} | ${entry.ticker} | ${entry.rating} | pending]`
              : `[${entry.date} | ${entry.ticker} | ${entry.rating} | ${entry.raw} | ${entry.alpha} | ${entry.holding}${
                  entry.resolved ? ` | resolved:${entry.resolved}` : ''
                }]`;

            return (
              <div
                key={entry.id}
                className="bg-white border border-[#E2E5E8] rounded-md overflow-hidden"
              >
                <div className="px-5 py-3 bg-[#FBFBFA] border-b border-[#E2E5E8] flex flex-wrap items-center justify-between gap-2">
                  <code className="text-xs font-mono-tabular font-semibold text-[#1C2126]">
                    {tag}
                  </code>
                  <div className="flex items-center gap-3 text-xs font-mono-tabular">
                    {entry.pending ? (
                      <span className="text-[#D97706] flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {t.outcomePending}
                      </span>
                    ) : (
                      <span className="text-[#087A59] flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.resolvedOn} {entry.resolved} · Alpha {entry.alpha}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <div className="text-xs font-semibold text-[#5D6670] mb-2">
                      {t.decisionHeader}
                    </div>
                    <MarkdownBlock content={entry.decision} editorialSerif={true} />
                  </div>
                  <div className="lg:col-span-5 lg:border-l lg:border-[#E2E5E8] lg:pl-6">
                    <div className="text-xs font-semibold text-[#5D6670] mb-2">
                      {t.reflectionHeader}
                    </div>
                    {entry.reflection ? (
                      <p className="font-serif-editorial text-[15.5px] leading-relaxed text-[#1C2126]">
                        {entry.reflection}
                      </p>
                    ) : (
                      <p className="text-xs text-[#5D6670] italic">{t.pendingReflectionNote}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
