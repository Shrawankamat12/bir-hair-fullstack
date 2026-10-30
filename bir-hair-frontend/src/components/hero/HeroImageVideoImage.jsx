import { HeroSlideShell, HeroHeading, HeroCta, SafeImg } from './HeroShared';
import HeroVideo from './HeroVideo';
import { FALLBACK } from './heroFallbacks';

// Slide 2 — left image · prominent central video · right image.
export default function HeroImageVideoImage({ slide, active, priority, onMediaActive }) {
  const images = slide.media.filter((m) => m.mediaType === 'image');
  const video = slide.media.find((m) => m.mediaType === 'video');
  const hasText = slide.title || slide.description;
  const sideImg = (m, i, className) => (
    <div className={`basis-[calc(50%-6px)] sm:basis-0 sm:grow ${className}`}>
      <SafeImg
        src={m.url}
        fallback={FALLBACK.sides[i]}
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
        {images[0] && sideImg(images[0], 0, '')}

        {video && (
          <div className="order-first basis-full sm:order-none sm:basis-0 sm:grow-[1.3]">
            <HeroVideo
              media={video}
              poster={video.thumbnail}
              fallbackPoster={FALLBACK.videoPoster}
              active={active}
              onMediaActive={onMediaActive}
              className="aspect-[4/3] w-full sm:aspect-[4/5]"
            />
          </div>
        )}

        {images[1] && sideImg(images[1], 1, '')}
      </div>

      {slide.ctaLabel && slide.ctaUrl && (
        <div className="mt-6 flex justify-center sm:mt-8">
          <HeroCta label={slide.ctaLabel} url={slide.ctaUrl} />
        </div>
      )}
    </HeroSlideShell>
  );
}