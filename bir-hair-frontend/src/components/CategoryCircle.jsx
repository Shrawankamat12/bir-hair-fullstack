import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../lib/api';

export default function CategoryCircle({ cat, variant = 'circle' }) {
  const ref = useRef(null);
  const imageUrl = resolveImageUrl(cat.image);

  function onMove(e) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(500px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.03)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = '';
  }

  // ---------- CARD VARIANT (used on Home page) ----------
  if (variant === 'card') {
    return (
      <Link
        to={`/shop?category=${cat.slug}`}
        className="group flex flex-col items-center gap-3 text-center"
      >
        {/* Gradient ring wrapper */}
        <div
          className="
            relative rounded-full p-[3px]
            bg-gradient-to-br from-[#f8b4ca] via-[#f13f7d] to-[#ed2165]
            shadow-[0_8px_20px_rgba(226,36,103,0.18)]
            transition-all duration-300 ease-out
            group-hover:shadow-[0_14px_30px_rgba(226,36,103,0.30)]
            group-hover:-translate-y-1
          "
        >
          <div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="
              relative h-[104px] w-[104px] sm:h-[124px] sm:w-[124px] lg:h-[136px] lg:w-[136px]
              overflow-hidden rounded-full
              border-[3px] border-white
              bg-white
              transition-transform duration-200 ease-out will-change-transform
            "
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={cat.name}
                className="
                  h-full w-full object-cover
                  transition-transform duration-500
                  group-hover:scale-110
                "
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#fff1f6]">
                <span className="text-2xl font-black text-[#ed2165]">
                  {cat.name.charAt(0)}
                </span>
              </div>
            )}

            {/* subtle bottom gradient for legibility if used with overlay text later */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </div>

        <span className="text-[11px] font-bold text-[#272329] sm:text-[12px] transition-colors duration-200 group-hover:text-[#ed2165]">
          {cat.name}
        </span>
      </Link>
    );
  }

  // ---------- CIRCLE VARIANT ----------
  return (
    <Link
      to={`/shop?category=${cat.slug}`}
      className="group flex flex-col items-center gap-2.5 text-center"
    >
      <div
        className="
          relative rounded-full p-[3px]
          bg-gradient-to-br from-[#f8b4ca] via-[#f13f7d] to-[#ed2165]
          shadow-[0_6px_16px_rgba(226,36,103,0.16)]
          transition-all duration-300
          group-hover:shadow-[0_10px_24px_rgba(226,36,103,0.28)]
          group-hover:-translate-y-0.5
        "
      >
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="
            relative h-[88px] w-[88px] sm:h-[100px] sm:w-[100px]
            overflow-hidden rounded-full border-[3px] border-white bg-white
            transition-transform duration-200 ease-out will-change-transform
          "
          style={
            imageUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(43,29,23,0.02), rgba(74,44,42,0.38)), url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          {!imageUrl && (
            <div className="flex h-full w-full items-center justify-center bg-[#fff1f6]">
              <span className="text-xl font-black text-[#ed2165]">
                {cat.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      <span className="text-[10px] font-bold text-[#272329] sm:text-[11px] transition-colors duration-200 group-hover:text-[#ed2165]">
        {cat.name}
      </span>
    </Link>
  );
}