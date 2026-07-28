import { createContext, useCallback, useContext, useState } from 'react';

export function Badge({ tone = 'neutral', children, className = '' }) {
  const tones = {
    neutral: 'bg-surface-muted text-ink-muted border-border-soft',
    success: 'bg-[#e7f7ee] text-[#1c8a4b] border-transparent',
    warning: 'bg-[#fff4e0] text-[#b3760a] border-transparent',
    danger: 'bg-[#fde8e8] text-[#c22b2b] border-transparent',
    brand: 'bg-brand-gradient-soft text-brand-magenta border-transparent',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

const STATUS_TONE = {
  active: 'success', published: 'success', completed: 'success', delivered: 'success', paid: 'success', 'in stock': 'success', approved: 'success',
  inactive: 'neutral', draft: 'neutral', placed: 'neutral',
  pending: 'warning', low: 'warning', 'low stock': 'warning', processing: 'warning', confirmed: 'warning', packed: 'warning', shipped: 'warning',
  cancelled: 'danger', rejected: 'danger', 'out of stock': 'danger', failed: 'danger', banned: 'danger', returned: 'danger',
};

export function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  return <Badge tone={STATUS_TONE[s] || 'neutral'}>{status}</Badge>;
}

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin text-brand-magenta ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title = 'No records found', hint, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 px-6 text-center">
      <div className="h-12 w-12 rounded-full bg-brand-gradient-soft flex items-center justify-center text-brand-magenta mb-1">
        {icon || (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8l-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /></svg>
        )}
      </div>
      <p className="font-semibold text-ink text-sm">{title}</p>
      {hint && <p className="text-xs text-ink-faint max-w-xs">{hint}</p>}
      {action}
    </div>
  );
}

/* ---------------- Toast system ---------------- */
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const api = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'danger'),
    info: (m) => push(m, 'neutral'),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed top-5 right-5 z-[300] flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md shadow-lg border px-4 py-3 text-[13.5px] font-medium bg-white animate-[fadeIn_.15s_ease] ${
              t.tone === 'success' ? 'border-l-4 border-l-success border-border-soft' :
              t.tone === 'danger' ? 'border-l-4 border-l-danger border-border-soft' :
              'border-l-4 border-l-brand-magenta border-border-soft'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
