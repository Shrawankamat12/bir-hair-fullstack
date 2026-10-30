const SLIDE_TYPES = Object.freeze({
  EXISTING: 'existing-hero',
  IMAGE_VIDEO_IMAGE: 'image-video-image',
  CONTENT_GALLERY: 'content-gallery',
  INSTAGRAM_SINGLE: 'instagram-single',
  INSTAGRAM_MULTI: 'instagram-multi',
});

const HERO_SLIDE_TYPES = Object.values(SLIDE_TYPES);
const MEDIA_TYPES = Object.freeze(['image', 'video', 'instagram']);

const SLIDE_RULES = Object.freeze({
  [SLIDE_TYPES.EXISTING]: { maxByType: {}, maxTotal: 0 },
  [SLIDE_TYPES.IMAGE_VIDEO_IMAGE]: { maxByType: { image: 2, video: 1 }, maxTotal: 3 },
  [SLIDE_TYPES.CONTENT_GALLERY]: { maxByType: { image: 6 }, maxTotal: 6 },
  [SLIDE_TYPES.INSTAGRAM_SINGLE]: { maxByType: { instagram: 1 }, maxTotal: 1 },
  [SLIDE_TYPES.INSTAGRAM_MULTI]: { maxByType: { instagram: 8 }, maxTotal: 8 },
});

const LIMITS = Object.freeze({
  title: 160,
  description: 600,
  ctaLabel: 40,
  mediaText: 160,
  url: 2048,
  autoplayMin: 3000,
  autoplayMax: 30000,
  autoplayDefault: 6000,
});

const INSTAGRAM_URLS = Object.freeze({
  reel: 'https://www.instagram.com/reel/DXWPbUcAXIt/?exln=ZHpmeG5nZ25vZXUw',
  video1: 'https://www.instagram.com/reel/De16wrGBLB5/?rpxt=MWEzaTh2YXRtazU2bw==',
  video2: 'https://www.instagram.com/p/DeWDCm_AQv0/?mdxt=MWp3eDByamduZ3lsaQ==',
  video3: 'https://www.instagram.com/reel/DeEM1eIBdI2/?dlrf=MTdyc3d1Nm42b3VxZQ==',
});

const DEFAULT_HERO_SLIDER = Object.freeze({
  enabled: true,
  autoplay: true,
  autoplayInterval: LIMITS.autoplayDefault,
  slides: [
    {
      slideType: SLIDE_TYPES.EXISTING,
      title: '', description: '', ctaLabel: '', ctaUrl: '',
      media: [],
      order: 0,
      enabled: true,
    },
    {
      slideType: SLIDE_TYPES.IMAGE_VIDEO_IMAGE,
      title: '', description: '', ctaLabel: '', ctaUrl: '',
      media: [
        { mediaType: 'image', url: '', thumbnail: '', alt: 'Natural human hair, styled look', title: 'Left image', order: 0, enabled: true },
        { mediaType: 'video', url: '', thumbnail: '', alt: 'B.I.R Hair brand video', title: 'Center video', order: 1, enabled: true },
        { mediaType: 'image', url: '', thumbnail: '', alt: 'Natural human hair, close-up of texture', title: 'Right image', order: 2, enabled: true },
      ],
      order: 1,
      enabled: true,
    },
    {
      slideType: SLIDE_TYPES.CONTENT_GALLERY,
      title: 'Natural Human Hair, Beautifully Made',
      description: 'Extensions, bundles, closures and wigs in straight, wavy and curly textures — made in our Delhi factory.',
      ctaLabel: 'Shop the Collection',
      ctaUrl: '/shop',
      media: [
        { mediaType: 'image', url: '', thumbnail: '', alt: 'Hair extensions', title: 'Hair extensions', order: 0, enabled: true },
        { mediaType: 'image', url: '', thumbnail: '', alt: 'Raw hair bundles', title: 'Raw hair bundles', order: 1, enabled: true },
        { mediaType: 'image', url: '', thumbnail: '', alt: 'Wigs', title: 'Wigs', order: 2, enabled: true },
        { mediaType: 'image', url: '', thumbnail: '', alt: 'Closures and frontals', title: 'Closures and frontals', order: 3, enabled: true },
        { mediaType: 'image', url: '', thumbnail: '', alt: 'Blonde hair', title: 'Blonde hair', order: 4, enabled: true },
        { mediaType: 'image', url: '', thumbnail: '', alt: 'Bulk hair', title: 'Bulk hair', order: 5, enabled: true },
      ],
      order: 2,
      enabled: true,
    },
    {
      slideType: SLIDE_TYPES.INSTAGRAM_SINGLE,
      title: 'Featured Reel',
      description: 'Watch the latest from B.I.R Hair India Factory on Instagram.',
      ctaLabel: '', ctaUrl: '',
      media: [
        { mediaType: 'instagram', url: INSTAGRAM_URLS.reel, thumbnail: '', alt: 'Instagram Reel from B.I.R Hair India Factory', title: 'Featured Reel', order: 0, enabled: true },
      ],
      order: 3,
      enabled: true,
    },
    {
      slideType: SLIDE_TYPES.INSTAGRAM_MULTI,
      title: 'From Our Instagram',
      description: 'Swipe through our latest videos.',
      ctaLabel: '', ctaUrl: '',
      media: [
        { mediaType: 'instagram', url: INSTAGRAM_URLS.video1, thumbnail: '', alt: 'Instagram video 1 from B.I.R Hair India Factory', title: 'Video 1', order: 0, enabled: true },
        { mediaType: 'instagram', url: INSTAGRAM_URLS.video2, thumbnail: '', alt: 'Instagram video 2 from B.I.R Hair India Factory', title: 'Video 2', order: 1, enabled: true },
        { mediaType: 'instagram', url: INSTAGRAM_URLS.video3, thumbnail: '', alt: 'Instagram video 3 from B.I.R Hair India Factory', title: 'Video 3', order: 2, enabled: true },
      ],
      order: 4,
      enabled: true,
    },
  ],
});

module.exports = {
  SLIDE_TYPES,
  HERO_SLIDE_TYPES,
  MEDIA_TYPES,
  SLIDE_RULES,
  LIMITS,
  INSTAGRAM_URLS,
  DEFAULT_HERO_SLIDER,
};