import { HeroSlideShell, HeroHeading, HeroCta, SafeImg } from './HeroShared';
import { FALLBACK } from './heroFallbacks';

// Per-column aspect ratios chosen so the three staggered columns end at a similar height.
const ASPECTS = [
  ['aspect-[3/4]', 'aspect-square'],
  ['aspect-square', 'aspect-[4/5]'],
  ['aspect-[3/4]', 'aspect-square'],
];

// Slide 3 — heading + copy + CTA beside a staggered mosaic of hair photography.
export default function HeroContentGallery({ slide, priority }) {
  const images = slide.media.filter((m) => m.mediaType === 'image').slice(0, 6);
  const cols = Math.min(3, Math.max(1, images.length));
  const columns = Array.from({ length: cols }, (_, c) =>
    images.map((m, i) => ({ m, i })).filter(({ i }) => i % cols === c)
  );

  return (
    <HeroSlideShell>
      <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <div className="relative z-10">
          <HeroHeading title={slide.title} description={slide.description} />
          {slide.ctaLabel && slide.ctaUrl && (
            <div className="mt-6">
              <HeroCta label={slide.ctaLabel} url={slide.ctaUrl} />
            </div>
          )}
        </div>

        <div
          className="mx-auto grid w-full max-w-[560px] items-start gap-2.5 sm:gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {columns.map((items, c) => (
            <div key={c} className={`flex flex-col gap-2.5 sm:gap-4 ${c === 1 && cols === 3 ? 'pt-6 sm:pt-10' : ''}`}>
              {items.map(({ m, i }, row) => (
                <SafeImg
                  key={`${i}-${m.url}`}
                  src={m.url}
                  fallback={FALLBACK.gallery[i % FALLBACK.gallery.length]}
                  alt={m.alt || m.title || 'Natural human hair'}
                  loading={priority ? 'eager' : 'lazy'}
                  className={`${cols === 1 ? 'aspect-[4/5]' : ASPECTS[c][row % 2]} w-full rounded-[14px] object-cover shadow-[0_14px_30px_-18px_rgba(55,20,35,0.5)] ring-1 ring-white/70 sm:rounded-[18px]`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </HeroSlideShell>
  );
}