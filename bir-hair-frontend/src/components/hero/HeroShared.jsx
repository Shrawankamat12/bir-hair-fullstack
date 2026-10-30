import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isExternalUrl } from '../../lib/heroSlider';

/** Same frame as the original hero (pink rounded panel on white) so every slide feels native. */
export function HeroSlideShell({ children, className = '' }) {
  return (
    <section className="relative overflow-hidden bg-white pt-3">
      <div className="absolute inset-x-3 top-3 bottom-0 rounded-[22px] bg-gradient-to-br from-[#fff9fb] via-[#fff0f5] to-[#ffd9e7] sm:inset-x-5 lg:inset-x-14 lg:rounded-[26px]" />
      <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-[#ed2165]/10 blur-[80px] lg:h-[420px] lg:w-[420px]" />
      <div className="container relative z-10">
        <div
          className={`flex min-h-[500px] flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:min-h-[560px] lg:px-14 ${className}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/** <img> that falls back to a bundled photo, then to a neutral block — never a broken-image icon. */
export function SafeImg({ src, fallback, alt = '', className = '', loading = 'lazy', style }) {
  const [bad, setBad] = useState([]);
  const current = [src, fallback].filter(Boolean).find((c) => !bad.includes(c));
  if (!current) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] ${className}`}
        style={style}
      />
    );
  }
  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
      onError={() => setBad((b) => [...b, current])}
      className={className}
      style={style}
    />
  );
}

const CTA_CLASS =
  'group inline-flex min-h-[44px] min-w-[112px] items-center justify-center gap-1.5 rounded-[8px] bg-gradient-to-r from-[#ed2165] to-[#d9165b] px-6 text-[11px] font-bold text-white shadow-[0_10px_24px_rgba(226,36,103,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(226,36,103,0.36)]';

/** Internal paths use the router; external URLs open safely in a new tab. */
export function HeroCta({ label, url, className = '' }) {
  if (!label || !url) return null;
  const inner = (
    <>
      {label}
      <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
    </>
  );
  return isExternalUrl(url) ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`${CTA_CLASS} ${className}`}>
      {inner}
    </a>
  ) : (
    <Link to={url} className={`${CTA_CLASS} ${className}`}>
      {inner}
    </Link>
  );
}

/** Brand-pink accent on the last word(s) of a heading (same look as the original hero). */
export function AccentTitle({ text }) {
  const words = (text || '').split(' ');
  if (words.length < 2) return text;
  const n = words.length === 2 ? 1 : 2;
  return (
    <>
      {words.slice(0, -n).join(' ')} <span className="text-[#e22667]">{words.slice(-n).join(' ')}</span>
    </>
  );
}

export function HeroHeading({ title, description, align = 'left', children }) {
  if (!title && !description && !children) return null;
  return (
    <div className={align === 'center' ? 'mx-auto max-w-[640px] text-center' : ''}>
      {title && (
        <h2 className="font-serif text-[34px] font-bold leading-[1.08] tracking-[-1px] text-[#17141a] sm:text-[44px] lg:text-[52px]">
          <AccentTitle text={title} />
        </h2>
      )}
      {description && (
        <p
          className={`mt-3 max-w-[520px] text-[13px] leading-6 text-[#575057] sm:text-[15px] sm:leading-7 ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}