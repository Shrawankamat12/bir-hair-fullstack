const baseField =
  'w-full px-3.5 py-2.5 rounded-sm border border-border bg-surface-muted text-[14px] font-sans text-ink outline-none transition-all duration-150 focus:border-brand-magenta focus:bg-white focus:shadow-[0_0_0_3px_rgba(168,59,171,0.12)] disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-ink-faint';

export function FormField({ label, htmlFor, required, error, hint, className = '', children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-[12.5px] font-semibold text-ink-muted mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-[11.5px] text-ink-faint">{hint}</p>}
      {error && <p className="mt-1 text-[11.5px] text-danger font-medium">{error}</p>}
    </div>
  );
}

export function Input({ className = '', error, ...props }) {
  return <input className={`${baseField} ${error ? 'border-danger' : ''} ${className}`} {...props} />;
}

export function Textarea({ className = '', error, rows = 4, ...props }) {
  return <textarea rows={rows} className={`${baseField} resize-y ${error ? 'border-danger' : ''} ${className}`} {...props} />;
}

export function Select({ className = '', error, children, ...props }) {
  return (
    <select className={`${baseField} appearance-none bg-no-repeat bg-[right_0.9rem_center] pr-9 ${error ? 'border-danger' : ''} ${className}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23746c85' stroke-width='1.5' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E\")" }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ label, className = '', ...props }) {
  return (
    <label className={`inline-flex items-center gap-2 text-[13.5px] font-medium text-ink cursor-pointer select-none ${className}`}>
      <input type="checkbox" className="h-4 w-4 rounded border-border text-brand-magenta accent-[var(--brand-magenta)] cursor-pointer" {...props} />
      {label}
    </label>
  );
}

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 disabled:opacity-50 ${checked ? 'bg-brand-gradient' : 'bg-border'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-150 ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
      </button>
      {label && <span className="text-[13.5px] font-medium text-ink">{label}</span>}
    </label>
  );
}

export function TagInput({ value = [], onChange, placeholder = 'Type and press Enter…' }) {
  const add = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const v = e.target.value.trim();
      if (!value.includes(v)) onChange([...value, v]);
      e.target.value = '';
    }
  };
  return (
    <div className={`${baseField} flex flex-wrap gap-1.5 items-center min-h-[44px]`}>
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 bg-brand-gradient-soft text-brand-magenta text-xs font-semibold px-2 py-1 rounded-sm">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((v) => v !== tag))} className="hover:opacity-70">×</button>
        </span>
      ))}
      <input onKeyDown={add} placeholder={value.length ? '' : placeholder} className="flex-1 min-w-[120px] bg-transparent outline-none text-[13.5px]" />
    </div>
  );
}
