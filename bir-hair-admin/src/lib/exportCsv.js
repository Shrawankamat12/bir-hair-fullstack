// Plain client-side CSV export — no extra dependency needed. Works off the
// same `columns`/`rows` shape DataTable already uses.
export function exportToCsv(filename, columns, rows) {
  const escape = (val) => {
    const s = val === null || val === undefined ? '' : String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = columns.map((c) => escape(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escape(c.render ? stripTags(c.render(row)) : row[c.key])).join(',')
  );

  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// column.render() can return JSX for the table view — for CSV we only want text.
function stripTags(value) {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'props' in value) {
    return value.props?.children ?? '';
  }
  return String(value ?? '');
}
