/**
 * Bulk & Wholesale bundle-quantity discount tiers.
 *
 * This used to be duplicated as bare 0.95 / 0.9 / 0.85 multipliers only
 * inside ProductDetail's marketing table — the cart/checkout never applied
 * them, so a customer buying 6+ bundles was shown a discounted price here
 * but charged full price at checkout. This file is now the ONLY place the
 * tiers are defined; ProductDetail's table and StoreContext's cart totals
 * both read from here, so the two can never drift apart again.
 */
export const BULK_TIERS = [
  { minQty: 1, maxQty: 2, label: '1–2 bundles', discountPct: 0 },
  { minQty: 3, maxQty: 5, label: '3–5 bundles', discountPct: 5 },
  { minQty: 6, maxQty: 10, label: '6–10 bundles', discountPct: 10 },
  { minQty: 11, maxQty: Infinity, label: '11+ bundles', discountPct: 15 },
];

export function getBulkTier(qty) {
  return BULK_TIERS.find((t) => qty >= t.minQty && qty <= t.maxQty) || BULK_TIERS[0];
}

export function getBulkDiscountPct(qty) {
  return getBulkTier(qty).discountPct;
}

/** Per-unit price after the quantity tier discount is applied. */
export function getBulkUnitPrice(basePrice, qty) {
  const pct = getBulkDiscountPct(qty);
  return Math.round(basePrice * (1 - pct / 100));
}

/** Per-unit rupee amount saved by the tier discount (0 for tier 1). */
export function getBulkDiscountPerUnit(basePrice, qty) {
  return basePrice - getBulkUnitPrice(basePrice, qty);
}
