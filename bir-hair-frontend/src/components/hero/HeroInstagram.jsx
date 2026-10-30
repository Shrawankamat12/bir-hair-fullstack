import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiPlay, FiX, FiExternalLink } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { HeroSlideShell, HeroCta, SafeImg, AccentTitle } from './HeroShared';
import { FALLBACK } from './heroFallbacks';

/*
 * Instagram embedding notes
 *  - We never inject Instagram's embed.js or any HTML. The player is a plain <iframe>
 *    whose src is built from a validated instagram.com shortcode (lib/heroSlider.js).
 *  - A cross-origin iframe can't tell us whether the post is private/deleted/blocked,
 *    so the UI never claims "playing": every card keeps a visible "Open on Instagram"
 *    link that works regardless of whether the embed renders.
 */

function EmbedFrame({ info, title }) {
  return (
    <iframe
      className="h-full w-full border-0 bg-white"
      src={info.embedUrl}
      title={title}
      loading="lazy"
      allow="encrypted-media; picture-in-picture; fullscreen; clipboard-write"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
    />
  );
}

function OpenLink({ href, className = '', children = 'Open on Instagram' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${className}`}
    >
      {children}
      <FiExternalLink aria-hidden="true" />
    </a>
  );
}

/** Portrait thumbnail with play control. `onPlay` mounts the embed (inline or modal). */
function ReelThumb({ item, fallback, onPlay, priority, showLink, aspect = 'aspect-[9/16]' }) {
  const label = item.title || item.alt || 'Instagram video';
  return (
    <div className="rounded-[26px] bg-white p-1.5 shadow-[0_30px_55px_-24px_rgba(226,36,103,0.6)]">
    <div className={`relative ${aspect} w-full overflow-hidden rounded-[20px] bg-[#2b0f1f]`}>
      <SafeImg
        src={item.thumbnail}
        fallback={fallback}
        alt={item.alt || label}
        loading={priority ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/25" />
      <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#d9165b] shadow">
        <FaInstagram aria-hidden="true" />
      </span>
      <button type="button" onClick={onPlay} aria-label={`Play Instagram video: ${label}`} className="hs-play">
        <FiPlay aria-hidden="true" />
      </button>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3 text-white">
        {item.title && <span className="line-clamp-2 text-[12px] font-bold leading-tight">{item.title}</span>}
        {showLink && <OpenLink href={item.url} className="text-white/90 hover:text-white" />}
      </div>
    </div>
    </div>
  );
}

// ---------------------------------------------------------------- Slide 4
export function HeroInstagramSingle({ slide, active, priority, onMediaActive }) {
  const item = slide.media.find((m) => m.mediaType === 'instagram');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);
  useEffect(() => {
    if (!playing) return undefined;
    onMediaActive?.(true);
    return () => onMediaActive?.(false);
  }, [playing, onMediaActive]);

  if (!item) return null;
  const label = item.title || 'Instagram Reel';

  return (
    <HeroSlideShell className="!pb-14 lg:!pt-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="relative z-10 order-2 lg:order-1">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.6px] text-[#ed2165] shadow-[0_4px_14px_rgba(226,36,103,0.10)]">
            <FaInstagram aria-hidden="true" /> Instagram Reel
          </span>
          {slide.title && (
            <h2 className="font-serif text-[36px] font-bold leading-[1.05] tracking-[-1px] text-[#17141a] sm:text-[50px] lg:text-[64px]">
              <AccentTitle text={slide.title} />
            </h2>
          )}
          {slide.description && (
            <p className="mt-4 max-w-[480px] text-[13.5px] leading-7 text-[#575057] sm:text-[15.5px] sm:leading-8">
              {slide.description}
            </p>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <OpenLink
              href={item.url}
              className="min-h-[46px] rounded-[8px] bg-gradient-to-r from-[#ed2165] to-[#d9165b] px-6 text-white shadow-[0_10px_24px_rgba(226,36,103,0.28)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Watch on Instagram
            </OpenLink>
            <HeroCta label={slide.ctaLabel} url={slide.ctaUrl} className="!bg-none !bg-white !text-[#e22667] border border-pink-200 !shadow-none" />
          </div>
        </div>

        <div className="relative order-1 flex justify-center lg:order-2">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#f9b3cd] to-[#ef6c9d] opacity-70 lg:h-[470px] lg:w-[470px]" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[330px] w-[190px] -translate-x-[135%] -translate-y-1/2 -rotate-[9deg] rounded-[26px] bg-white/55 ring-1 ring-white sm:block lg:h-[400px] lg:w-[230px]" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[330px] w-[190px] translate-x-[35%] -translate-y-1/2 rotate-[9deg] rounded-[26px] bg-white/55 ring-1 ring-white sm:block lg:h-[400px] lg:w-[230px]" aria-hidden="true" />
          <div className="relative z-10 w-[min(74%,260px)] lg:w-[270px]" data-hero-noswipe>
            {playing ? (
              <>
                <div className="rounded-[26px] bg-white p-1.5 shadow-[0_30px_55px_-24px_rgba(226,36,103,0.6)]">
                  <div className="aspect-[9/16] w-full overflow-hidden rounded-[20px] bg-white">
                    <EmbedFrame info={item.instagram} title={label} />
                  </div>
                </div>
                <p className="mt-2 text-center text-[11px] text-[#777078]">
                  Not loading? <OpenLink href={item.url} className="text-[#e22667]">Open on Instagram</OpenLink>
                </p>
              </>
            ) : (
              <ReelThumb
                item={item}
                fallback={FALLBACK.reel}
                priority={priority}
                onPlay={() => setPlaying(true)}
                showLink={false}
              />
            )}
          </div>
        </div>
      </div>
    </HeroSlideShell>
  );
}

// ---------------------------------------------------------------- Slide 5 modal
function EmbedModal({ item, onClose }) {
  const closeRef = useRef(null);
  const label = item.title || 'Instagram video';

  useEffect(() => {
    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={label} className="flex w-[min(92vw,380px)] flex-col gap-2">
        <div className="flex items-center justify-between text-white">
          <OpenLink href={item.url} className="text-white">Open on Instagram</OpenLink>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg hover:bg-white/25"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <div className="h-[min(78vh,640px)] w-full overflow-hidden rounded-2xl bg-white">
          <EmbedFrame info={item.instagram} title={label} />
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------- Slide 5
export function HeroInstagramMulti({ slide, active, priority, onMediaActive }) {
  const items = slide.media.filter((m) => m.mediaType === 'instagram');
  const [openIdx, setOpenIdx] = useState(null);
  const close = useCallback(() => setOpenIdx(null), []);

  useEffect(() => {
    if (!active) setOpenIdx(null);
  }, [active]);
  const isOpen = openIdx !== null;
  useEffect(() => {
    if (!isOpen) return undefined;
    onMediaActive?.(true);
    return () => onMediaActive?.(false);
  }, [isOpen, onMediaActive]);

  return (
    <HeroSlideShell className="!pb-12 !pt-6 sm:!pt-8 lg:!pt-7">
      <div className="pointer-events-none absolute left-1/2 top-[62%] h-[280px] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#f9b3cd]/60 via-[#ef6c9d]/50 to-[#f9b3cd]/60 blur-[60px]" aria-hidden="true" />
      <div className="relative mx-auto mb-3 flex w-full max-w-[1000px] flex-col items-center gap-1 text-center sm:mb-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:text-left">
        {slide.title && (
          <h2 className="font-serif text-[30px] font-bold leading-[1.08] tracking-[-1px] text-[#17141a] sm:text-[38px] lg:text-[44px]">
            <AccentTitle text={slide.title} />
          </h2>
        )}
        {slide.description && (
          <p className="max-w-[420px] text-[13px] leading-6 text-[#575057] sm:text-[14.5px] lg:pb-1.5 lg:text-right">
            {slide.description}
          </p>
        )}
      </div>

      <div
        data-hero-rail
        className="hs-rail relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 py-5 sm:gap-6 lg:justify-center-safe"
      >
        {items.map((item, i) => (
          <div
            key={item.url}
            className={`w-[72%] shrink-0 snap-center sm:w-[240px] lg:w-[255px] ${items.length === 3 && i === 1 ? 'lg:-translate-y-2 lg:scale-[1.05]' : ''}`}
          >
            <ReelThumb
              item={item}
              fallback={FALLBACK.videos[i % FALLBACK.videos.length]}
              priority={priority}
              onPlay={() => setOpenIdx(i)}
              aspect="aspect-[2/3]"
              showLink
            />
          </div>
        ))}
      </div>

      {slide.ctaLabel && slide.ctaUrl && (
        <div className="mt-4 flex justify-center">
          <HeroCta label={slide.ctaLabel} url={slide.ctaUrl} />
        </div>
      )}

      {isOpen && items[openIdx] && <EmbedModal item={items[openIdx]} onClose={close} />}
    </HeroSlideShell>
  );
}