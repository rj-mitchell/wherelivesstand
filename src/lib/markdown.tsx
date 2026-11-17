// Renders the small subset of Markdown that scripts/build_dataset.py writes into SOURCES.md (headings,
// paragraphs, bullet lists, tables, links, bold and code), so the method page shows the generated file
// itself rather than a copy that could drift.
import React from 'react';

function inline(text: string, key = 0): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+(?:\([^)]*\))?[^)\s]*)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1]) out.push(<a key={k} href={m[2]}>{m[1]}</a>);
    else if (m[3]) out.push(<strong key={k}>{m[3]}</strong>);
    else if (m[4]) out.push(<code key={k} className="text-[0.9em]">{m[4]}</code>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

/** Turns Markdown into React elements. `skipTitle` drops a leading "# " heading. */
export function renderMarkdown(md: string, { skipTitle = false, headingOffset = 0 } = {}): React.ReactNode[] {
  const lines = md.replace(/\r/g, '').split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;
  let n = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      i++;
      if (h[1].length === 1 && skipTitle) continue;
      const level = Math.min(6, h[1].length + headingOffset);
      out.push(React.createElement(`h${level}`, { key: n++ }, inline(h[2], n)));
      continue;
    }
    if (line.trim().startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      out.push(
        <div key={n++} className="overflow-x-auto my-4">
          <table className="w-full text-sm font-sans border-collapse min-w-[40rem]">
            <thead>
              <tr className="border-b border-ink text-left">
                {cells(head).map((c, j) => (
                  <th key={j} scope="col" className="py-1.5 pr-3 font-semibold align-bottom">{inline(c, j)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-b border-faint align-top">
                  {cells(r).map((c, j) => (
                    <td key={j} className="py-1.5 pr-3">{inline(c, j)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      out.push(
        <ul key={n++}>
          {items.map((t, j) => (
            <li key={j}>{inline(t, j)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||\s*[-*]\s)/.test(lines[i])) para.push(lines[i++]);
    out.push(<p key={n++}>{inline(para.join(' '), n)}</p>);
  }
  return out;
}
