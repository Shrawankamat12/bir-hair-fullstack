import { useRef } from 'react';
import { Link } from 'react-router-dom';
import './CategoryCircle.css';

export default function CategoryCircle({ cat }) {
  const ref = useRef(null);

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
    <Link to="/shop" className="catcircle-wrap">
      <div
        ref={ref}
        className={`catcircle tone-${cat.tone} ${cat.img ? 'has-img' : ''}`}
        style={cat.img ? { backgroundImage: `linear-gradient(180deg, rgba(43,29,23,0.02), rgba(74,44,42,0.38)), url(${cat.img})` } : undefined}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {!cat.img && <span className="catcircle-glyph">{cat.name.charAt(0)}</span>}
      </div>
      <span className="catcircle-label">{cat.name}</span>
    </Link>
  );
}
