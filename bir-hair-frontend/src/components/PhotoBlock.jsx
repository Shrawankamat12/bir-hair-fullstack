const TONES = {
  espresso: ['#3d1128', '#5c1f3d'],
  gold: ['#F85D9B', '#F7B9D3'],
  beige: ['#FFEAF3', '#f5c7dd'],
  cream: ['#FFF9FC', '#fde0ed'],
  brown: ['#1F1F1F', '#3a2530'],
};

export default function PhotoBlock({ tone = 'beige', ratio = '4/5', label, sub, className = '', rounded = 20, strands = true, src, alt = '', zoom = 1 }) {
  const [c1, c2] = TONES[tone] || TONES.beige;
  const id = Math.random().toString(36).slice(2, 8);
  return (
    <div
      className={`photoblock ${src ? 'has-img' : ''} ${className}`}
      style={{ aspectRatio: ratio, borderRadius: rounded, background: `linear-gradient(155deg, ${c1}, ${c2})` }}
    >
      {src && (
  <img
    className="photoblock-img"
    src={src}
    alt={alt}
    loading="lazy"
    style={zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: 'center 25%' } : undefined}
  />
)}
      {src && (label || sub) && <div className="photoblock-scrim" />}
      {!src && strands && (
        <svg className="photoblock-strands" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={`pg-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M20 0 C 60 90, 0 140, 40 300" stroke={`url(#pg-${id})`} strokeWidth="18" fill="none" />
          <path d="M90 0 C 130 100, 70 160, 110 300" stroke={`url(#pg-${id})`} strokeWidth="14" fill="none" />
          <path d="M180 0 C 220 90, 160 150, 200 300" stroke={`url(#pg-${id})`} strokeWidth="20" fill="none" />
          <path d="M260 0 C 300 100, 230 160, 270 300" stroke={`url(#pg-${id})`} strokeWidth="12" fill="none" />
        </svg>
      )}
      {(label || sub) && (
        <div className="photoblock-caption">
          {label && <span className="photoblock-label">{label}</span>}
          {sub && <span className="photoblock-sub">{sub}</span>}
        </div>
      )}
    </div>
  );
}