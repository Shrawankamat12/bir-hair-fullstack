// Dependency-free "Export to Excel": Excel natively opens an HTML table
// saved with an .xls extension, so this needs no bundled library while
// still giving a real, formatted spreadsheet (not just comma text).
function cellText(col, row) {
  const v = col.render ? col.render(row) : row[col.key];
  if (v && typeof v === 'object' && 'props' in v) return v.props?.children ?? '';
  return v ?? '';
}

export function exportToExcel(filename, columns, rows) {
  const head = columns.map((c) => `<th style="background:#f3eef8;padding:8px;border:1px solid #ddd;">${c.label}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${columns.map((c) => `<td style="padding:8px;border:1px solid #ddd;">${cellText(c, row)}</td>`).join('')}</tr>`)
    .join('');
  const html = `<html><head><meta charset="utf-8"></head><body><table>${`<tr>${head}</tr>`}${body}</table></body></html>`;
  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
