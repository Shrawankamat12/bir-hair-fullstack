import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiPlay, FiX, FiExternalLink } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { HeroSlideShell, HeroHeading, HeroCta, SafeImg } from './HeroShared';
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
function ReelThumb({ item, fallback, onPlay, priority, showLink }) {
  const label = item.title || item.alt || 'Instagram video';
  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[20px] bg-[#2b0f1f] shadow-[0_26px_50px_-26px_rgba(226,36,103,0.55)] ring-1 ring-white/60">
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
    <HeroSlideShell>
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="relative z-10 order-2 lg:order-1">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.5px] text-[#ed2165] shadow-[0_4px_14px_rgba(226,36,103,0.10)]">
            <FaInstagram aria-hidden="true" /> Instagram Reel
          </span>
          <HeroHeading title={slide.title} description={slide.description} />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <HeroCta label={slide.ctaLabel} url={slide.ctaUrl} />
            <OpenLink
              href={item.url}
              className="min-h-[44px] rounded-[8px] border border-pink-200 bg-white px-5 text-[#e22667] hover:bg-[#fff8fa]"
            >
              Watch on Instagram
            </OpenLink>
          </div>
        </div>

        <div className="order-1 mx-auto w-[min(78%,300px)] lg:order-2 lg:w-[min(100%,250px)]" data-hero-noswipe>
          {playing ? (
            <>
              <div className="aspect-[9/16] w-full overflow-hidden rounded-[20px] bg-white shadow-[0_26px_50px_-26px_rgba(226,36,103,0.55)] ring-1 ring-white/60">
                <EmbedFrame info={item.instagram} title={label} />
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
    <HeroSlideShell>
      <div className="mb-6 sm:mb-8">
        <HeroHeading title={slide.title} description={slide.description} align="center" />
      </div>

      <div
        data-hero-rail
        className="hs-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 sm:gap-5 lg:justify-center-safe"
      >
        {items.map((item, i) => (
          <div key={item.url} className="w-[62%] shrink-0 snap-center sm:w-[210px] lg:w-[210px]">
            <ReelThumb
              item={item}
              fallback={FALLBACK.videos[i % FALLBACK.videos.length]}
              priority={priority}
              onPlay={() => setOpenIdx(i)}
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