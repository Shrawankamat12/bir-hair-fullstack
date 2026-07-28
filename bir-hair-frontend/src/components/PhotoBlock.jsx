import './PhotoBlock.css';

const TONES = {
  espresso: ['#3a2620', '#5a3a2f'],
  gold: ['#C9A227', '#E6C76A'],
  beige: ['#EFE5D8', '#dcc9a8'],
  cream: ['#F8F4ED', '#e7dcc8'],
  brown: ['#4A2C2A', '#6b4038'],
};

export default function PhotoBlock({ tone = 'beige', ratio = '4/5', label, sub, className = '', rounded = 20, strands = true, src, alt = '' }) {
  const [c1, c2] = TONES[tone] || TONES.beige;
  const id = Math.random().toString(36).slice(2, 8);
  return (
    <div
      className={`photoblock ${src ? 'has-img' : ''} ${className}`}
      style={{ aspectRatio: ratio, borderRadius: rounded, background: `linear-gradient(155deg, ${c1}, ${c2})` }}
    >
      {src && <img className="photoblock-img" src={src} alt={alt} loading="lazy" />}
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
