import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../lib/api';
import './CategoryCircle.css';

export default function CategoryCircle({ cat }) {
  const ref = useRef(null);
  const imageUrl = resolveImageUrl(cat.image);

  function onMove(e) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(500px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.05)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = '';
  }

  return (
    <Link to={`/shop?category=${cat.slug}`} className="catcircle-wrap">
      <div
        ref={ref}
        className={`catcircle tone-${cat.tone || 'gold'} ${imageUrl ? 'has-img' : ''}`}
        style={
          imageUrl
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(43,29,23,0.02), rgba(74,44,42,0.38)), url(${imageUrl})`,
              }
            : undefined
        }
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {!imageUrl && <span className="catcircle-glyph">{cat.name.charAt(0)}</span>}
      </div>
      <span className="catcircle-label">{cat.name}</span>
    </Link>
  );
}