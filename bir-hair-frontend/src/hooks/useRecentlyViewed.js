import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'bir_recently_viewed_v1';
const MAX_ITEMS = 12;

function read() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/** Records `product` as viewed (call from ProductDetail) and returns the
 * current list (excluding the product passed in, if any) for rendering a
 * "Recently Viewed" rail anywhere in the app. */
export function useRecentlyViewed(product) {
  const [list, setList] = useState(read);

  useEffect(() => {
    if (!product?.id) return;
    setList((prev) => {
      const next = [
        { id: product.id, name: product.name, image: product.image, price: product.price, mrp: product.mrp, tone: product.tone, rating: product.rating, reviews: product.reviews, discountPct: product.discountPct, badge: product.badge, hairType: product.hairType, length: product.length, category: product.category, sku: product.sku, stock: product.stock },
        ...prev.filter((p) => p.id !== product.id),
      ].slice(0, MAX_ITEMS);
      write(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const others = product?.id ? list.filter((p) => p.id !== product.id) : list;
  return others;
}

export function useRecentlyViewedList() {
  const [list, setList] = useState(read);
  const refresh = useCallback(() => setList(read()), []);
  useEffect(() => { refresh(); }, [refresh]);
  return list;
}
