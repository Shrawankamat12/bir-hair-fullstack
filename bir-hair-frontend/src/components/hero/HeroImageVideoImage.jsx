import { useEffect, useMemo, useRef, useState } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { getVideoEmbed } from '../../lib/video';
import { resolveImageUrl } from '../../lib/api';
import { HeroSlideShell, HeroHeading, HeroCta, SafeImg } from './HeroShared';

/*
 * Centre video: starts by itself (muted, looping) as soon as the slide is on
 * screen — no click needed. Browsers only allow autoplay when muted, so a sound
 * button lets the visitor turn the audio on. The player exists only while the slide
 * is active. Supports a hosted MP4/WebM link, YouTube and Vimeo. A cover image is
 * optional and only shown if the admin set one.
 */
function AutoVideo({ media, poster, active, onMediaActive, className = '' }) {
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);

  const embed = useMemo(() => getVideoEmbed(media?.url), [media?.url]);
  const label = media?.title || media?.alt || 'Brand video';
  const live = !!embed && !failed && active;

  useEffect(() => {
    if (!active) setMuted(true);
  }, [active]);

  // Once the visitor turns the sound on they are "watching": pause the carousel autoplay.
  useEffect(() => {
    if (!live || muted) return undefined;
    onMediaActive?.(true);
    return () => onMediaActive?.(false);
  }, [live, muted, onMediaActive]);

  // Some browsers ignore the autoPlay attribute until muted is set as a property.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !live) return;
    v.muted = muted;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [live, muted]);

  let player = null;
  if (live) {
    if (embed.type === 'file') {
      player = (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full bg-black object-cover"
          src={resolveImageUrl(embed.embedUrl)}
          poster={poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={!muted}
          aria-label={label}
          onError={() => setFailed(true)}
        />
      );
    } else {
      const id = embed.embedUrl.split('/').pop();
      const src =
        embed.type === 'youtube'
          ? `${embed.embedUrl}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&rel=0`
          : `${embed.embedUrl}?autoplay=1&muted=1&loop=1`;
      player = (
        <iframe
          className="absolute inset-0 h-full w-full border-0 bg-black"
          src={src}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    }
  }

  return (
    <div
      data-hero-noswipe
      className={`relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] shadow-[0_30px_60px_-24px_rgba(226,36,103,0.45)] ring-1 ring-white/60 ${className}`}
    >
      {poster && (
        <SafeImg src={poster} alt={media?.alt || 'Video preview'} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
      )}
      {player}

      {live && embed.type === 'file' && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          aria-pressed={!muted}
          className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-lg text-white backdrop-blur transition hover:bg-[#ed2165]"
        >
          {muted ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}
        </button>
      )}

      {failed && (
        <p role="status" className="absolute inset-x-4 bottom-4 rounded-lg bg-black/60 px-3 py-2 text-center text-xs font-medium text-white">
          This video is currently unavailable.
        </p>
      )}
    </div>
  );
}

// Slide 2 — the video plays directly. Left / right images are optional: they appear
// only when the admin has set an image for them; otherwise the video is shown alone.
export default function HeroImageVideoImage({ slide, active, priority, onMediaActive }) {
  const images = slide.media.filter((m) => m.mediaType === 'image' && m.url);
  const video = slide.media.find((m) => m.mediaType === 'video');
  const hasText = slide.title || slide.description;
  const hasSides = images.length > 0;

  const sideImg = (m) => (
    <div className="basis-[calc(50%-6px)] sm:basis-0 sm:grow">
      <SafeImg
        src={m.url}
        alt={m.alt || m.title || 'Natural human hair'}
        loading={priority ? 'eager' : 'lazy'}
        className="aspect-[3/4] w-full rounded-[18px] object-cover shadow-[0_18px_40px_-22px_rgba(55,20,35,0.5)] ring-1 ring-white/70"
      />
    </div>
  );

  return (
    <HeroSlideShell className="sm:!px-5 lg:!px-8 lg:!pt-6 lg:!pb-14">
      {hasText && (
        <div className="mb-6 sm:mb-8">
          <HeroHeading title={slide.title} description={slide.description} align="center" />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:gap-5 lg:gap-6">
        {images[0] && sideImg(images[0])}

        {video && (
          <div
            className={
              hasSides
                ? 'order-first basis-full sm:order-none sm:basis-0 sm:grow-[1.3]'
                : 'basis-full max-w-[900px]'
            }
          >
            <AutoVideo
              media={video}
              poster={video.thumbnail}
              active={active}
              onMediaActive={onMediaActive}
              className={hasSides ? 'aspect-[4/3] w-full sm:aspect-[4/5]' : 'aspect-video w-full'}
            />
          </div>
        )}

        {images[1] && sideImg(images[1])}
      </div>

      {slide.ctaLabel && slide.ctaUrl && (
        <div className="mt-6 flex justify-center sm:mt-8">
          <HeroCta label={slide.ctaLabel} url={slide.ctaUrl} />
        </div>
      )}
    </HeroSlideShell>
  );
}