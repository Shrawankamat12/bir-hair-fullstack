import { HeroSlideShell, HeroCta, SafeImg, AccentTitle } from './HeroShared';
import { FALLBACK } from './heroFallbacks';

// Slide 3 — heading + copy + CTA beside an even, staggered photo collage.
export default function HeroContentGallery({ slide, priority }) {
  const images = slide.media.filter((m) => m.mediaType === 'image').slice(0, 6);
  const cols = Math.min(3, Math.max(1, images.length));
  const columns = Array.from({ length: cols }, (_, c) =>
    images.map((m, i) => ({ m, i })).filter(({ i }) => i % cols === c)
  );

  return (
    <HeroSlideShell className="!pb-14 sm:!px-6 lg:!px-12 lg:!pt-8">
      <div className="grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
        <div className="relative z-10">
          {slide.title && (
            <h2 className="font-serif text-[34px] font-bold leading-[1.06] tracking-[-1px] text-[#17141a] sm:text-[46px] lg:text-[56px]">
              <AccentTitle text={slide.title} />
            </h2>
          )}
          {slide.description && (
            <p className="mt-4 max-w-[480px] text-[13.5px] leading-7 text-[#575057] sm:text-[15.5px] sm:leading-8">
              {slide.description}
            </p>
          )}
          {slide.ctaLabel && slide.ctaUrl && (
            <div className="mt-7">
              <HeroCta label={slide.ctaLabel} url={slide.ctaUrl} />
            </div>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-[700px]">
          <div className="pointer-events-none absolute -inset-6 rounded-full bg-[#ed2165]/10 blur-[70px]" aria-hidden="true" />
          <div
            className="relative grid items-start gap-2.5 sm:gap-4"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {columns.map((items, c) => (
              <div key={c} className={`flex flex-col gap-2.5 sm:gap-4 ${c === 1 && cols === 3 ? 'pt-6 sm:pt-10' : ''}`}>
                {items.map(({ m, i }) => (
                  <figure
                    key={`${i}-${m.url}`}
                    className="group relative m-0 aspect-[10/11] overflow-hidden rounded-[14px] bg-white shadow-[0_18px_36px_-18px_rgba(55,20,35,0.55)] ring-2 ring-white sm:rounded-[20px]"
                  >
                    <SafeImg
                      src={m.url}
                      fallback={FALLBACK.gallery[i % FALLBACK.gallery.length]}
                      alt={m.alt || m.title || 'Natural human hair'}
                      loading={priority ? 'eager' : 'lazy'}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
                    {m.title && (
                      <figcaption className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-12px)] truncate rounded-full bg-white/85 px-2 py-0.5 text-[8.5px] font-bold text-[#3a1b2a] backdrop-blur sm:bottom-3 sm:left-3 sm:px-3 sm:py-1 sm:text-[11px]">
                        {m.title}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </HeroSlideShell>
  );
}