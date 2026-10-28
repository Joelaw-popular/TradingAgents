import React from 'react';

interface MarkdownBlockProps {
  content: string;
  editorialSerif?: boolean;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-[#1C2126]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="font-mono-tabular text-[13px] bg-[#F2F4F5] px-1.5 py-0.5 rounded border border-[#E2E5E8] text-[#1C2126]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({ content, editorialSerif = true }) => {
  if (!content) {
    return <p className="text-sm text-[#5D6670] italic">No report content filed for this section.</p>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableHeader: string[] | null = null;
  let tableRows: string[][] = [];
  let listItems: string[] = [];

  const flushTable = (keyPrefix: string) => {
    if (tableHeader) {
      elements.push(
        <div key={`${keyPrefix}-tbl`} className="my-4 overflow-x-auto border border-[#E2E5E8] rounded">
          <table className="w-full border-collapse text-left text-[13px] font-sans tabular-nums">
            <thead>
              <tr className="bg-[#F2F4F5] border-b border-[#D3D8DC] text-[#1C2126]">
                {tableHeader.map((th, i) => (
                  <th key={i} className="py-2 px-3 font-semibold">
                    {renderInline(th)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E8] bg-white">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#FBFBFA]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-3 text-[#1C2126] align-top">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeader = null;
      tableRows = [];
    }
  };

  const flushList = (keyPrefix: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`${keyPrefix}-ul`}
          className={`my-2.5 space-y-1.5 pl-5 list-disc text-[#1C2126] ${
            editorialSerif ? 'font-serif-editorial text-[15.5px] leading-relaxed' : 'text-sm leading-relaxed'
          }`}
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushTable(`l-${index}`);
      flushList(`l-${index}`);
      return;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(`l-${index}`);
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) {
        return;
      }
      if (!tableHeader) {
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else {
      flushTable(`l-${index}`);
    }

    if (trimmed.startsWith('### ')) {
      flushList(`l-${index}`);
      elements.push(
        <h4 key={`h4-${index}`} className="mt-5 mb-2 text-sm font-semibold tracking-tight text-[#1C2126] font-sans">
          {trimmed.slice(4)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2));
      return;
    } else {
      flushList(`l-${index}`);
    }

    elements.push(
      <p
        key={`p-${index}`}
        className={`my-2.5 text-[#1C2126] ${
          editorialSerif ? 'font-serif-editorial text-[16px] leading-[1.65]' : 'text-sm leading-relaxed'
        }`}
      >
        {renderInline(trimmed)}
      </p>
    );
  });

  flushTable('end');
  flushList('end');

  return <div>{elements}</div>;
};
