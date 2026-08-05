const ICONS = {
  shield: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z M9 12l2 2 4-4" />,
  truck: <path d="M2 7h11v9H2z M13 10h4l3 3v3h-7z" />,
  lock: <path d="M4 10h16v10H4z M8 10V7a4 4 0 1 1 8 0v3" />,
  refresh: <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15.3 6.4L3 16 M3 21v-5h5" />,
  globe: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3c2.5 2.6 4 6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-6-4-9s1.5-6.4 4-9Z" />,
};

const DEFAULT_ITEMS = [
  { icon: 'shield', title: '100% Authentic', sub: 'Remy human hair' },
  { icon: 'truck', title: 'Fast Dispatch', sub: 'Ships in 24 hours' },
  { icon: 'lock', title: 'Secure Checkout', sub: '256-bit SSL' },
  { icon: 'refresh', title: 'Easy Returns', sub: '7-day window' },
];

export default function TrustBadges({ items = DEFAULT_ITEMS, className = '' }) {
  return (
    <div className={`trust-strip ${className}`}>
      {items.map((it) => (
        <div className="trust-strip-item" key={it.title}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[it.icon]}
          </svg>
          <div><strong>{it.title}</strong><span>{it.sub}</span></div>
        </div>
      ))}
    </div>
  );
}
