import { Link } from 'react-router-dom';

export function PageHeader({ title, subtitle, breadcrumbs, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-ink-faint mb-1.5">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {b.to ? <Link to={b.to} className="hover:text-brand-magenta transition-colors">{b.label}</Link> : <span>{b.label}</span>}
              </span>
            ))}
          </div>
        )}
        <h1 className="font-heading text-[22px] font-bold text-ink m-0 tracking-tight">{title}</h1>
        {subtitle && <p className="text-[13.5px] text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, className = '', children, padded = true }) {
  return (
    <div className={`bg-surface border border-border-soft rounded-lg shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
          {title && <h2 className="font-heading text-[15px] font-semibold text-ink m-0">{title}</h2>}
          {actions}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-border-soft mb-5 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-4 py-2.5 text-[13.5px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
            active === t.value ? 'border-brand-magenta text-brand-magenta' : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          {t.label}
          {typeof t.count === 'number' && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10.5px] ${active === t.value ? 'bg-brand-gradient-soft text-brand-magenta' : 'bg-surface-muted text-ink-faint'}`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, totalPages, onChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  return (
    <div className="flex items-center justify-between gap-4 px-2 py-3 text-[13px] text-ink-muted flex-wrap">
      <span>{totalItems > 0 ? `Showing ${from}–${to} of ${totalItems}` : ''}</span>
      <div className="flex items-center gap-1.5">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className="px-3 py-1.5 rounded-full border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:border-brand-magenta enabled:hover:text-brand-magenta font-medium transition-colors">← Prev</button>
        <span className="px-2">Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="px-3 py-1.5 rounded-full border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:border-brand-magenta enabled:hover:text-brand-magenta font-medium transition-colors">Next →</button>
      </div>
    </div>
  );
}

export function StatGrid({ children }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px] mb-7">{children}</div>;
}
