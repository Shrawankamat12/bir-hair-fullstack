import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { authApi, cartApi, wishlistApi, couponsApi } from '../lib/resources';
import { normalizeProduct } from '../lib/normalize';
import { ApiError } from '../lib/api';

const StoreContext = createContext(null);

function normalizeCartItem(item) {
  return { ...normalizeProduct(item.product), qty: item.qty };
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount }

  // Guest cart/wishlist accumulated before login, kept in a ref so it doesn't
  // trigger effects — pushed to the backend once the user actually signs in.
  const pendingGuestCart = useRef([]);
  const pendingGuestWishlist = useRef([]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const showError = useCallback((err, fallback = 'Something went wrong') => {
    showToast(err instanceof ApiError ? err.message : fallback, 'error');
  }, [showToast]);

  // ---- session bootstrap ----
  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await cartApi.get();
      setCart((res.data?.items || []).map(normalizeCartItem));
    } catch {
      // not logged in / no cart yet — leave as is
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    try {
      const res = await wishlistApi.get();
      setWishlist((res.data?.products || []).map(normalizeProduct));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshCart();
    refreshWishlist();
  }, [user, refreshCart, refreshWishlist]);

  // ---- auth actions ----
  const syncGuestDataToBackend = useCallback(async () => {
    for (const item of pendingGuestCart.current) {
      await cartApi.add(item.id, item.qty).catch(() => {});
    }
    for (const product of pendingGuestWishlist.current) {
      await wishlistApi.toggle(product.id).catch(() => {});
    }
    pendingGuestCart.current = [];
    pendingGuestWishlist.current = [];
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    await syncGuestDataToBackend();
    await Promise.all([refreshCart(), refreshWishlist()]);
    showToast(`Welcome back, ${res.user.name.split(' ')[0]}!`);
    return res.user;
  }, [syncGuestDataToBackend, refreshCart, refreshWishlist, showToast]);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    setUser(res.user);
    await syncGuestDataToBackend();
    await Promise.all([refreshCart(), refreshWishlist()]);
    showToast(`Welcome to B.I.R, ${res.user.name.split(' ')[0]}!`);
    return res.user;
  }, [syncGuestDataToBackend, refreshCart, refreshWishlist, showToast]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
    setCart([]);
    setWishlist([]);
    setAppliedCoupon(null);
    showToast('Signed out');
  }, [showToast]);

  // ---- cart actions (backend-synced when logged in, local otherwise) ----
  const addToCart = useCallback((product, qty = 1) => {
    if (user) {
      cartApi
        .add(product.id, qty)
        .then((res) => setCart((res.data?.items || []).map(normalizeCartItem)))
        .catch((err) => showError(err, 'Could not add to cart'));
    } else {
      pendingGuestCart.current.push({ id: product.id, qty });
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
        return [...prev, { ...product, qty }];
      });
    }
    showToast(`Added "${product.name}" to cart`);
  }, [user, showToast, showError]);

  const removeFromCart = useCallback((id) => {
    if (user) {
      cartApi
        .remove(id)
        .then((res) => setCart((res.data?.items || []).map(normalizeCartItem)))
        .catch((err) => showError(err, 'Could not remove item'));
    } else {
      setCart((prev) => prev.filter((i) => i.id !== id));
    }
  }, [user, showError]);

  const updateQty = useCallback((id, qty) => {
    const safeQty = Math.max(1, qty);
    if (user) {
      cartApi
        .update(id, safeQty)
        .then((res) => setCart((res.data?.items || []).map(normalizeCartItem)))
        .catch((err) => showError(err, 'Could not update quantity'));
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: safeQty } : i)));
    }
  }, [user, showError]);

  const clearCart = useCallback(() => setCart([]), []);

  const applyCoupon = useCallback(async (code, subtotal) => {
    const res = await couponsApi.apply(code, subtotal);
    setAppliedCoupon(res.data);
    showToast(`Coupon "${res.data.code}" applied`);
    return res.data;
  }, [showToast]);

  const clearCoupon = useCallback(() => setAppliedCoupon(null), []);

  // ---- wishlist actions ----
  const toggleWishlist = useCallback((product) => {
    if (user) {
      wishlistApi
        .toggle(product.id)
        .then((res) => {
          const products = (res.data?.products || []).map(normalizeProduct);
          setWishlist(products);
          const stillIn = products.some((p) => p.id === product.id);
          showToast(stillIn ? `Saved "${product.name}" to wishlist` : `Removed "${product.name}" from wishlist`);
        })
        .catch((err) => showError(err, 'Could not update wishlist'));
    } else {
      setWishlist((prev) => {
        const exists = prev.find((i) => i.id === product.id);
        if (exists) {
          pendingGuestWishlist.current = pendingGuestWishlist.current.filter((p) => p.id !== product.id);
          showToast(`Removed "${product.name}" from wishlist`);
          return prev.filter((i) => i.id !== product.id);
        }
        pendingGuestWishlist.current.push(product);
        showToast(`Saved "${product.name}" to wishlist`);
        return [...prev, product];
      });
    }
  }, [user, showToast, showError]);

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((n, i) => n + i.price * i.qty, 0), [cart]);
  const cartMrpTotal = useMemo(() => cart.reduce((n, i) => n + i.mrp * i.qty, 0), [cart]);

  const isWishlisted = useCallback((id) => wishlist.some((i) => i.id === id), [wishlist]);

  const value = {
    user, authChecked, login, register, logout,
    cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartSubtotal, cartMrpTotal,
    wishlist, toggleWishlist, isWishlisted,
    appliedCoupon, applyCoupon, clearCoupon,
    toast, showToast, showError,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
