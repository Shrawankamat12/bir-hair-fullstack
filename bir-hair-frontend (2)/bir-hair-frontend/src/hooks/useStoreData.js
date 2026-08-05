import { useAsync } from './useAsync';
import {
  productsApi, categoriesApi, blogsApi, faqsApi, testimonialsApi, bannersApi, reviewsApi,
  subcategoriesApi, brandsApi, collectionsApi, attributesApi, siteContentApi,
} from '../lib/resources';
import {
  normalizeProduct, normalizeCategory, normalizeBlog, normalizeFaq, normalizeTestimonial,
  normalizeBanner, normalizeReview, normalizeSubCategory, normalizeBrand, normalizeCollection,
  normalizeAttribute, normalizeSiteContent,
} from '../lib/normalize';

export function useProducts(query = {}) {
  const key = JSON.stringify(query);
  const { data, loading, error, refetch } = useAsync(() => productsApi.list(query), [key]);
  return { products: (data?.data || []).map(normalizeProduct), total: data?.total || 0, loading, error, refetch };
}

export function useProduct(idOrSlug) {
  const { data, loading, error, refetch } = useAsync(() => productsApi.get(idOrSlug), [idOrSlug]);
  return { product: normalizeProduct(data?.data), loading, error, refetch };
}

export function useProductsByBadge(badge) {
  const { data, loading, error } = useAsync(() => productsApi.byBadge(badge), [badge]);
  return { products: (data?.data || []).map(normalizeProduct), loading, error };
}

// Admin-controlled homepage shelves: Featured / New Arrival / Trending / Premium / Best Seller / Flash Sale / Recommended
export function useProductsByFlag(flag, limit) {
  const { data, loading, error } = useAsync(() => productsApi.byFlag(flag, limit), [flag, limit]);
  return { products: (data?.data || []).map(normalizeProduct), loading, error };
}

export function useSubCategories(categoryId) {
  const { data, loading, error } = useAsync(() => subcategoriesApi.list(categoryId), [categoryId]);
  return { subcategories: (data?.data || []).map(normalizeSubCategory), loading, error };
}

export function useBrands() {
  const { data, loading, error } = useAsync(() => brandsApi.list(), []);
  return { brands: (data?.data || []).map(normalizeBrand), loading, error };
}

export function useCollections() {
  const { data, loading, error } = useAsync(() => collectionsApi.list(), []);
  return { collections: (data?.data || []).map(normalizeCollection), loading, error };
}

export function useAttributes(type) {
  const { data, loading, error } = useAsync(() => attributesApi.list(type), [type]);
  return { attributes: (data?.data || []).map(normalizeAttribute), loading, error };
}

// Site-wide CMS content powering Home page sections, Footer and Header — admin-editable via
// Website Content in the admin panel. Falls back to `null` while loading; callers should
// guard with `siteContent?.field ?? fallbackDefault` so the page never breaks pre-configuration.
export function useSiteContent() {
  const { data, loading, error } = useAsync(() => siteContentApi.get(), []);
  return { siteContent: normalizeSiteContent(data?.data), loading, error };
}

export function useCategories() {
  const { data, loading, error } = useAsync(() => categoriesApi.list(), []);
  return { categories: (data?.data || []).map(normalizeCategory), loading, error };
}

export function useBlogs(category) {
  const { data, loading, error } = useAsync(() => blogsApi.list(category), [category]);
  return { blogs: (data?.data || []).map(normalizeBlog), loading, error };
}

export function useBlog(slug) {
  const { data, loading, error } = useAsync(() => blogsApi.get(slug), [slug]);
  return { blog: normalizeBlog(data?.data), loading, error };
}

export function useFaqs() {
  const { data, loading, error } = useAsync(() => faqsApi.list(), []);
  return { faqs: (data?.data || []).map(normalizeFaq), loading, error };
}

export function useTestimonials() {
  const { data, loading, error } = useAsync(() => testimonialsApi.list(), []);
  return { testimonials: (data?.data || []).map(normalizeTestimonial), loading, error };
}

export function useBanners(placement) {
  const { data, loading, error } = useAsync(() => bannersApi.list(placement), [placement]);
  return { banners: (data?.data || []).map(normalizeBanner), loading, error };
}

export function useProductReviews(productId) {
  const { data, loading, error, refetch } = useAsync(
    () => (productId ? reviewsApi.forProduct(productId) : Promise.resolve({ data: [] })),
    [productId]
  );
  return { reviews: (data?.data || []).map(normalizeReview), loading, error, refetch };
}
