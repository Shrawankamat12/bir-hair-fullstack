import { useEffect } from 'react';
import Button from './Button.jsx';

function useEscClose(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const fn = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEscClose(open, onClose);
  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[rgba(26,12,34,0.45)] backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`w-full ${widths[size]} max-h-[88vh] flex flex-col bg-white rounded-lg shadow-lg overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft shrink-0">
          <h3 className="font-heading font-semibold text-[16px] text-ink m-0">{title}</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-soft shrink-0 bg-surface-muted/40">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, footer, width = 'max-w-lg' }) {
  useEscClose(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-[rgba(26,12,34,0.45)] backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`w-full ${width} h-full bg-white shadow-lg flex flex-col animate-[slideIn_.2s_ease]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft shrink-0">
          <h3 className="font-heading font-semibold text-[16px] text-ink m-0">{title}</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-soft shrink-0 bg-surface-muted/40">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title = 'Are you sure?', message, tone = 'danger', confirmLabel = 'Confirm', onConfirm, onCancel, loading }) {
  useEscClose(open, onCancel);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[rgba(26,12,34,0.45)] backdrop-blur-[2px]">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-heading font-semibold text-[16px] text-ink mb-2">{title}</h3>
        <p className="text-[13.5px] text-ink-muted leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'dangerSolid' : 'primary'} size="sm" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export default { Modal, Drawer, ConfirmDialog };
