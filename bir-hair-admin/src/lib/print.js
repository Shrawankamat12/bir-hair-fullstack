/** Opens a clean, brand-styled print window for a table (list pages) or arbitrary HTML (invoices, slips). */
export function printTable(title, columns, rows) {
  const head = columns.map((c) => `<th>${c.label}</th>`).join('');
  const cellText = (col, row) => {
    const v = col.render ? col.render(row) : row[col.key];
    return v && typeof v === 'object' && 'props' in v ? v.props?.children ?? '' : v ?? '';
  };
  const body = rows.map((row) => `<tr>${columns.map((c) => `<td>${cellText(c, row)}</td>`).join('')}</tr>`).join('');
  printHtml(title, `
    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `);
}

export function printHtml(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Inter', 'Segoe UI', sans-serif; color: #241b2e; padding: 32px; }
          h1 { font-size: 20px; margin: 0 0 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #ece7f4; font-size: 13px; }
          th { background: #faf8fd; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: .03em; }
          @media print { @page { margin: 20mm; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${bodyHtml}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}
