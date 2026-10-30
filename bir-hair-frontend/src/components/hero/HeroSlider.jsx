import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useHeroSlider } from '../../hooks/useStoreData';
import { buildHeroModel, SLIDE } from '../../lib/heroSlider';
import HeroImageVideoImage from './HeroImageVideoImage';
import HeroContentGallery from './HeroContentGallery';
import { HeroInstagramSingle, HeroInstagramMulti } from './HeroInstagram';
import './hero.css';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * Homepage hero. `existingSlide` is the storefront's original hero, rendered
 * untouched as Slide 1. Until the admin configures the carousel (or if the API
 * fails) only that original hero is shown — the page degrades to exactly what it
 * looked like before this feature.
 */
export default function HeroSlider({ existingSlide }) {
  const { heroSlider, error } = useHeroSlider();
  const model = useMemo(() => buildHeroModel(heroSlider, error), [heroSlider, error]);

  if (model.mode === 'hidden') return null;

  const slides =
    model.mode === 'carousel' ? model.slides : [{ key: SLIDE.EXISTING, type: SLIDE.EXISTING, media: [] }];

  return (
    <Carousel
      slides={slides}
      existingSlide={existingSlide}
      autoplay={model.mode === 'carousel' && model.autoplay}
      interval={model.interval || 6000}
    />
  );
}

function renderSlide(slide, props) {
  switch (slide.type) {
    case SLIDE.IMAGE_VIDEO_IMAGE:
      return <HeroImageVideoImage slide={slide} {...props} />;
    case SLIDE.CONTENT_GALLERY:
      return <HeroContentGallery slide={slide} {...props} />;
    case SLIDE.INSTAGRAM_SINGLE:
      return <HeroInstagramSingle slide={slide} {...props} />;
    case SLIDE.INSTAGRAM_MULTI:
      return <HeroInstagramMulti slide={slide} {...props} />;
    default:
      return null;
  }
}

function Carousel({ slides, existingSlide, autoplay, interval }) {
  const count = slides.length;
  const multi = count > 1;
  const [index, setIndex] = useState(0);
  const current = Math.min(index, count - 1);
  const [height, setHeight] = useState(null);

  // Everything that should pause autoplay
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const slideRefs = useRef([]);
  const touchStart = useRef(null);
  const mediaCount = useRef(0);

  const goTo = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  // Players report play/stop here; autoplay stays paused while any is active.
  const onMediaActive = useCallback((on) => {
    mediaCount.current = Math.max(0, mediaCount.current + (on ? 1 : -1));
    setMediaBusy(mediaCount.current > 0);
  }, []);

  const paused = hovered || focused || touching || mediaBusy || !inView || !tabVisible;
  const canAutoplay = autoplay && multi && !reducedMotion && !paused;

  useEffect(() => {
    if (!canAutoplay) return undefined;
    const id = window.setTimeout(() => setIndex((i) => (Math.min(i, count - 1) + 1) % count), interval);
    return () => window.clearTimeout(id);
  }, [canAutoplay, current, interval, count]);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Viewport height follows the active slide (slides have different natural heights).
  useLayoutEffect(() => {
    const el = slideRefs.current[current];
    if (!el) return undefined;
    const update = () => setHeight(Math.ceil(el.getBoundingClientRect().height));
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [current, count]);

  // ---- touch / swipe (ignores touches inside players and scrollable rails) ----
  const insideViewport = (e) => viewportRef.current?.contains(e.target);

  const onTouchStart = (e) => {
    if (!multi || !insideViewport(e)) return;
    setTouching(true);
    const target = e.target;
    const rail = target.closest?.('[data-hero-rail]');
    const railScrolls = rail && rail.scrollWidth > rail.clientWidth + 2;
    if (target.closest?.('[data-hero-noswipe]') || railScrolls || e.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    if (!multi || !insideViewport(e)) return;
    setTouching(false);
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1));
  };
  const onTouchCancel = () => {
    touchStart.current = null;
    setTouching(false);
  };

  const onKeyDown = (e) => {
    if (!multi || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    if (!rootRef.current?.contains(e.target)) return;
    if (e.target.closest?.('input,textarea,select,video,iframe,[contenteditable],[data-hero-noswipe]')) return;
    e.preventDefault();
    goTo(current + (e.key === 'ArrowRight' ? 1 : -1));
  };

  return (
    <section
      ref={rootRef}
      className="hs-root"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      onFocusCapture={(e) => e.target.matches?.(':focus-visible') && setFocused(true)}
      onBlurCapture={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div
        ref={viewportRef}
        className="hs-viewport"
        style={height ? { height } : undefined}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        <div
          className="hs-track"
          style={{ transform: `translate3d(${-current * 100}%,0,0)` }}
          aria-live={autoplay && !paused ? 'off' : 'polite'}
        >
          {slides.map((slide, i) => {
            const isActive = i === current;
            const near = Math.abs(i - current) <= 1;
            return (
              <div
                key={slide.key}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="hs-slide"
                role={multi ? 'group' : undefined}
                aria-roledescription={multi ? 'slide' : undefined}
                aria-label={multi ? `${i + 1} of ${count}` : undefined}
                aria-hidden={isActive ? undefined : true}
                inert={isActive ? undefined : true}
              >
                {slide.type === SLIDE.EXISTING
                  ? existingSlide
                  : renderSlide(slide, { active: isActive, priority: near, onMediaActive })}
              </div>
            );
          })}
        </div>
      </div>

      {multi && (
        <>
          <button type="button" className="hs-arrow hs-arrow--prev" aria-label="Previous slide" onClick={() => goTo(current - 1)}>
            <FiChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="hs-arrow hs-arrow--next" aria-label="Next slide" onClick={() => goTo(current + 1)}>
            <FiChevronRight aria-hidden="true" />
          </button>
          <div className="hs-dots" role="group" aria-label="Choose slide">
            {slides.map((slide, i) => (
              <button
                key={slide.key}
                type="button"
                className="hs-dot"
                aria-label={`Go to slide ${i + 1} of ${count}`}
                aria-current={i === current ? 'true' : undefined}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}