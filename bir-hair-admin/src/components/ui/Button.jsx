const variants = {
  primary:
    'bg-brand-gradient text-white shadow-[0_4px_12px_rgba(168,59,171,0.28)] hover:shadow-[0_6px_16px_rgba(168,59,171,0.36)] hover:-translate-y-px border border-transparent',
  secondary:
    'bg-white text-ink border border-border hover:border-brand-magenta hover:text-brand-magenta',
  danger:
    'bg-white text-danger border border-danger hover:bg-danger hover:text-white',
  dangerSolid:
    'bg-danger text-white border border-danger hover:opacity-90',
  ghost:
    'bg-transparent text-ink-muted border border-transparent hover:bg-surface-muted',
  subtle:
    'bg-surface-muted text-ink border border-border-soft hover:border-brand-magenta hover:text-brand-magenta',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-[13.5px]',
  lg: 'px-5 py-3 text-sm',
  icon: 'p-2',
};

export default function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <As
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </As>
  );
}
