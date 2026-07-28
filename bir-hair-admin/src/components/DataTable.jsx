import { PageLoader, EmptyState } from './ui/Feedback.jsx';

function SortIcon({ dir }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className={`inline ml-1 transition-transform ${dir === 'desc' ? 'rotate-180' : ''}`}>
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Presentational, reusable table. All state (search/sort/pagination/selection)
 * is owned by the caller — typically via useEntityList() — so this component
 * can be dropped into any module's list page with the same props shape.
 */
export default function DataTable({
  columns,
  rows,
  getRowId = (r) => r._id || r.id,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  selected = [],
  onToggleSelect,
  onToggleSelectAll,
  sort,
  onSort,
  loading = false,
  emptyTitle = 'No records found',
  emptyHint = 'Try adjusting your search or filters, or add a new record.',
}) {
  if (loading) return <PageLoader label="Loading records…" />;

  const actionCols = onEdit || onDelete || onView;

  return (
    <div className="overflow-x-auto rounded-md border border-border-soft">
      <table className="w-full border-collapse bg-surface text-[13.5px]">
        <thead>
          <tr className="bg-surface-muted">
            {selectable && (
              <th className="w-10 px-3 py-3 text-left">
                <input type="checkbox" className="h-4 w-4 accent-[var(--brand-magenta)]" checked={rows.length > 0 && selected.length === rows.length} onChange={onToggleSelectAll} />
              </th>
            )}
            {columns.map((c) => (
              <th
                key={c.key}
                onClick={() => c.sortable && onSort?.(c.key)}
                className={`px-3.5 py-3 text-left font-semibold text-ink-muted uppercase text-[11px] tracking-wide whitespace-nowrap ${c.sortable ? 'cursor-pointer select-none hover:text-brand-magenta' : ''}`}
              >
                {c.label}
                {c.sortable && sort?.key === c.key && <SortIcon dir={sort.dir} />}
              </th>
            ))}
            {actionCols && <th className="px-3.5 py-3 text-right font-semibold text-ink-muted uppercase text-[11px] tracking-wide">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0) + (actionCols ? 1 : 0)}>
                <EmptyState title={emptyTitle} hint={emptyHint} />
              </td>
            </tr>
          )}
          {rows.map((row) => {
            const id = getRowId(row);
            return (
              <tr key={id} className="border-t border-border-soft hover:bg-[#fbf7fd] transition-colors">
                {selectable && (
                  <td className="px-3 py-2.5">
                    <input type="checkbox" className="h-4 w-4 accent-[var(--brand-magenta)]" checked={selected.includes(id)} onChange={() => onToggleSelect(id)} />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} className="px-3.5 py-2.5 text-ink align-middle">{c.render ? c.render(row) : (row[c.key] ?? '—')}</td>
                ))}
                {actionCols && (
                  <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                    <div className="inline-flex gap-1.5">
                      {onView && (
                        <button onClick={() => onView(row)} className="px-2.5 py-1.5 rounded-sm border border-border bg-white text-xs font-medium hover:border-brand-magenta hover:text-brand-magenta transition-colors">View</button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="px-2.5 py-1.5 rounded-sm border border-border bg-white text-xs font-medium hover:border-brand-magenta hover:text-brand-magenta transition-colors">Edit</button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row)} className="px-2.5 py-1.5 rounded-sm border border-danger text-danger bg-white text-xs font-medium hover:bg-danger hover:text-white transition-colors">Delete</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
