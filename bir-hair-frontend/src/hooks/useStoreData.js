import { useAsync } from './useAsync';
import {
  productsApi, categoriesApi, blogsApi, faqsApi, testimonialsApi, bannersApi, reviewsApi,
} from '../lib/resources';
import {
  normalizeProduct, normalizeCategory, normalizeBlog, normalizeFaq, normalizeTestimonial,
  normalizeBanner, normalizeReview,
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
