export default function StarRating({ value = 5, size = 13 }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.4 && value - full < 0.9;
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: 'var(--gold)' }} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && hasHalf);
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.3">
            <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6-6-3.2-6 3.2 1.2-6.6-4.8-4.7 6.6-.9L12 2.5z" />
          </svg>
        );
      })}
    </span>
  );
}
