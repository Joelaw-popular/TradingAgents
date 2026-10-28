import { AnalysisRunState } from '../types/trading';

const TAURIC_LOGO_SVG = `<svg width="993" height="115" viewBox="0 0 993 115" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M189.86 95.0459V37.9779H165.924V29.9259H223.74V37.9779H199.804V95.0459H189.86ZM251.026 46.4259C256.071 46.4259 260.178 47.0272 263.345 48.2299C266.514 49.4032 268.89 51.3686 270.474 54.1259C272.058 56.8832 272.85 60.6379 272.85 65.3899V95.0459H264.666L263.961 89.8979H263.434C261.644 91.7752 259.386 93.2419 256.657 94.2979C253.929 95.3246 251.025 95.8379 247.946 95.8379C244.426 95.8379 241.419 95.2952 238.925 94.2099C236.432 93.0952 234.54 91.5406 233.249 89.5459C231.959 87.5512 231.313 85.2046 231.313 82.5059C231.313 78.2526 232.897 74.9672 236.065 72.6499C239.263 70.3032 244.337 68.8219 251.29 68.2059L263.258 67.0179V64.7299C263.258 61.9139 262.774 59.7139 261.806 58.1299C260.838 56.5459 259.371 55.4312 257.406 54.7859C255.47 54.1406 252.888 53.8179 249.662 53.8179C247.432 53.8179 245.012 54.0086 242.401 54.3899C239.82 54.7712 237.341 55.3432 234.965 56.1059V48.8019C237.312 48.0392 239.908 47.4526 242.754 47.0419C245.628 46.6312 248.386 46.4259 251.026 46.4259ZM250.541 89.0619C252.888 89.0619 255.162 88.6512 257.362 87.8299C259.562 86.9792 261.527 85.7179 263.258 84.0459V72.8259L252.038 73.9259C248.136 74.3659 245.35 75.2166 243.678 76.4779C242.005 77.7099 241.169 79.4699 241.169 81.7579C241.169 84.0752 241.947 85.8792 243.501 87.1699C245.056 88.4312 247.403 89.0619 250.541 89.0619ZM313.339 95.8379C307.59 95.8379 303.087 94.2979 299.831 91.2179C296.575 88.1086 294.947 76.6979V47.1739H304.715V76.1699C304.715 80.1886 305.624 83.0779 307.443 84.8379C309.291 86.5979 311.916 87.4779 315.319 87.4779C317.871 87.4779 320.379 86.9939 322.843 86.0259C325.336 85.0286 327.492 83.5766 329.311 81.6699V47.1739H339.079V95.0459H330.983L330.367 89.9419H329.883C327.624 91.8486 325.072 93.3152 322.227 94.3419C319.382 95.3392 316.419 95.8379 313.339 95.8379ZM362.371 47.1739H370.423L371.171 53.2899H371.743C373.474 51.2072 375.703 49.5792 378.431 48.4059C381.188 47.2326 384.063 46.6459 387.055 46.6459C388.756 46.6459 390.355 46.7926 391.851 47.0859V55.8419C390.414 55.5779 388.654 55.4459 386.571 55.4459C383.99 55.4459 381.364 55.9446 378.695 56.9419C376.026 57.9392 373.84 59.4206 372.139 61.3859V95.0459H362.371V47.1739ZM409.069 95.0459V47.1739H418.837V95.0459H409.069ZM413.953 37.8459C411.871 37.8459 410.287 37.3912 409.201 36.4819C408.145 35.5726 407.617 34.2672 407.617 32.5659C407.617 30.8352 408.145 29.5152 409.201 28.6059C410.287 27.6672 411.871 27.1979 413.953 27.1979C416.036 27.1979 417.605 27.6672 418.661 28.6059C419.747 29.5152 420.289 30.8352 420.289 32.5659C420.289 34.2672 419.747 35.5726 418.661 36.4819C417.605 37.3912 416.036 37.8459 413.953 37.8459ZM464.85 95.9259C456.607 95.9259 450.315 93.8432 445.974 89.6779C441.662 85.5126 439.506 79.3526 439.506 71.1979C439.506 63.0139 441.779 56.8392 446.326 52.6739C450.902 48.5086 457.575 46.4259 466.346 46.4259C470.716 46.4259 474.735 46.9246 478.402 47.9219V55.7099C476.378 55.2406 474.486 54.8886 472.726 54.6539C470.966 54.4192 469.118 54.3019 467.182 54.3019C461.168 54.3019 456.71 55.6512 453.806 58.3499C450.931 61.0486 449.494 65.2872 449.494 71.0659C449.494 76.8739 450.858 81.1566 453.586 83.9139C456.343 86.6712 460.42 88.0499 465.818 88.0499C467.695 88.0499 469.616 87.8886 471.582 87.5659C473.547 87.2139 475.82 86.6712 478.402 85.9379V93.7259C474.236 95.1926 469.719 95.9259 464.85 95.9259Z" fill="#14C290"/><rect x="0.205322" y="14.873" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="43.1211" y="29.1787" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect y="29.1787" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="14.679" y="29.1787" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="14.679" y="44.0371" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="29.3579" y="29.1787" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="29.3579" y="44.0371" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="71.9265" y="29.1787" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="71.9265" y="44.0371" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="57.2478" y="29.1787" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="86.6055" y="29.1787" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="86.6055" y="44.0371" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="101.284" y="29.1787" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="29.3579" y="58.7158" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="71.9265" y="58.7158" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="43.1211" y="87.1592" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="57.2478" y="87.1592" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="29.3579" y="73.0205" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="71.9265" y="73.0205" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="29.3579" y="87.3262" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="71.9265" y="87.3262" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="43.1211" y="101.631" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/><rect x="57.2478" y="101.631" width="10.7289" height="10.7289" rx="5.36447" fill="#14C290"/></svg>`;

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function simpleMarkdownToHtml(md: string): string {
  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inTable = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      if (inTable) {
        htmlLines.push('</tbody></table></div>');
        inTable = false;
      }
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) {
        continue;
      }
      if (!inTable) {
        htmlLines.push('<div class="table"><table><thead><tr>');
        cells.forEach((c) => htmlLines.push(`<th>${formatInline(c)}</th>`));
        htmlLines.push('</tr></thead><tbody>');
        inTable = true;
      } else {
        htmlLines.push('<tr>');
        cells.forEach((c) => htmlLines.push(`<td>${formatInline(c)}</td>`));
        htmlLines.push('</tr>');
      }
      continue;
    } else if (inTable) {
      htmlLines.push('</tbody></table></div>');
      inTable = false;
    }

    if (trimmed.startsWith('### ')) {
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }
      htmlLines.push(`<h4>${formatInline(trimmed.slice(4))}</h4>`);
      continue;
    }

    if (trimmed.startsWith('- ')) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      htmlLines.push(`<li>${formatInline(trimmed.slice(2))}</li>`);
      continue;
    } else if (inList) {
      htmlLines.push('</ul>');
      inList = false;
    }

    htmlLines.push(`<p>${formatInline(trimmed)}</p>`);
  }

  if (inTable) htmlLines.push('</tbody></table></div>');
  if (inList) htmlLines.push('</ul>');

  return htmlLines.join('\n');
}

function formatInline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  out = out.replace(/`(.+?)`/g, '<code>$1</code>');
  return out;
}

export function generateStandaloneReportHtml(state: AnalysisRunState): string {
  const toneMap: Record<string, string> = {
    Buy: 'up',
    Overweight: 'up',
    Hold: 'level',
    Underweight: 'down',
    Sell: 'down',
  };
  const rating = state.final_rating;
  const tone = toneMap[rating] || 'review';

  const sections: { heading: string; agents: { name: string; content: string }[] }[] = [
    {
      heading: 'I. Analyst Team Reports',
      agents: [
        ...(state.market_report ? [{ name: 'Market Analyst', content: state.market_report }] : []),
        ...(state.sentiment_report ? [{ name: 'Sentiment Analyst', content: state.sentiment_report }] : []),
        ...(state.news_report ? [{ name: 'News Analyst', content: state.news_report }] : []),
        ...(state.fundamentals_report ? [{ name: 'Fundamentals Analyst', content: state.fundamentals_report }] : []),
      ],
    },
    {
      heading: 'II. Research Team Decision',
      agents: [
        { name: 'Bull Researcher', content: state.investment_debate_state.bull_history },
        { name: 'Bear Researcher', content: state.investment_debate_state.bear_history },
        { name: 'Research Manager', content: state.investment_plan },
      ],
    },
    {
      heading: 'III. Trading Team Plan',
      agents: [{ name: 'Trader', content: state.trader_investment_plan }],
    },
    {
      heading: 'IV. Risk Management Team Decision',
      agents: [
        { name: 'Aggressive Analyst', content: state.risk_debate_state.aggressive_history },
        { name: 'Conservative Analyst', content: state.risk_debate_state.conservative_history },
        { name: 'Neutral Analyst', content: state.risk_debate_state.neutral_history },
      ],
    },
    {
      heading: 'V. Portfolio Management Decision',
      agents: [{ name: 'Portfolio Manager', content: state.final_trade_decision }],
    },
  ];

  const s = state.run_settings;
  const bodyHtml = sections
    .map(
      (sec, idx) => `
      <section id="s${idx + 1}">
        <h2>${escapeHtml(sec.heading)}</h2>
        ${sec.agents
          .map(
            (ag, agIdx) => `
          <h3 id="s${idx + 1}-${agIdx + 1}">${escapeHtml(ag.name)}</h3>
          ${simpleMarkdownToHtml(ag.content)}
        `
          )
          .join('\n')}
      </section>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(state.company_of_interest)} ${escapeHtml(state.trade_date)} ${escapeHtml(rating)}: TradingAgents report</title>
<style>
:root {
  --paper: #fbfbfa; --ink: #1c2126; --muted: #5d6670; --rule: #e2e5e8; --wash: #f2f4f5;
  --accent: #087a59; --up: #087a59; --down: #b4372f; --level: #5d6670; --edge: #d3d8dc;
  --serif: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
  --sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 17px/1.62 var(--serif); }
.page { max-width: 48rem; margin: 0 auto; padding: 3.5rem 1.5rem 6rem; }
.masthead { padding-bottom: 1.75rem; border-bottom: 1px solid var(--rule); }
.masthead .logo svg { height: 1.6rem; width: auto; margin-bottom: 2rem; }
.masthead h1 { margin: 0; font: 600 2.5rem/1.1 var(--sans); letter-spacing: -0.02em; }
.rating.up { color: var(--up); } .rating.down { color: var(--down); } .rating.level { color: var(--level); }
.date { margin: 0.55rem 0 1.5rem; font: 1rem/1.4 var(--sans); color: var(--muted); }
.run { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 0.45rem 1.25rem; font: 0.85rem/1.5 var(--sans); }
.run dt { color: var(--muted); } .run dd { margin: 0; }
.field { display: inline-block; padding: 0 0.4rem; border: 1px solid var(--edge); border-radius: 4px; background: var(--wash); font: 0.8rem/1.6 monospace; }
main h2 { margin: 3.5rem 0 0.5rem; padding-top: 1.25rem; border-top: 2px solid var(--ink); font: 600 1.4rem/1.3 var(--sans); }
main h3 { margin: 2rem 0 0.6rem; padding-top: 0.9rem; border-top: 1px solid var(--rule); font: 600 1.15rem/1.35 var(--sans); color: var(--accent); }
main h4 { margin: 1.25rem 0 0.4rem; font: 600 1rem/1.4 var(--sans); }
table { border-collapse: collapse; width: 100%; font: 0.86rem/1.45 var(--sans); font-variant-numeric: tabular-nums; margin-bottom: 1.25rem; }
th, td { padding: 0.45rem 0.7rem; text-align: left; border-bottom: 1px solid var(--rule); }
th { font-weight: 600; border-bottom-color: var(--muted); }
.credit { margin-top: 4rem; padding-top: 1.25rem; border-top: 1px solid var(--rule); color: var(--muted); font: 0.8rem/1.4 var(--sans); }
</style>
</head>
<body>
<div class="page">
  <header class="masthead">
    <div class="logo">${TAURIC_LOGO_SVG}</div>
    <h1><span>${escapeHtml(state.company_of_interest)}</span> <span class="rating ${tone}">${escapeHtml(rating)}</span></h1>
    <p class="date">Analysis of ${escapeHtml(state.trade_date)}</p>
    <dl class="run">
      <dt>Deep model</dt><dd><span class="field">${escapeHtml(s.deep_think_provider)}</span> <span class="field">${escapeHtml(s.deep_think_llm)}</span></dd>
      <dt>Quick model</dt><dd><span class="field">${escapeHtml(s.quick_think_provider)}</span> <span class="field">${escapeHtml(s.quick_think_llm)}</span></dd>
      <dt>Analysts</dt><dd>${s.analysts.map((a) => `<span class="field">${escapeHtml(a)}</span>`).join(' ')}</dd>
      <dt>Debate rounds</dt><dd>research <span class="field">${s.max_debate_rounds}</span> · risk <span class="field">${s.max_risk_discuss_rounds}</span></dd>
      <dt>Version</dt><dd>TradingAgents ${escapeHtml(s.version)}</dd>
    </dl>
  </header>
  <main>
    ${bodyHtml}
  </main>
  <footer class="credit">TradingAgents multi-agent financial research framework · Tauric Research</footer>
</div>
</body>
</html>`;
}
