import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  authApi,
  cartApi,
  wishlistApi,
  couponsApi,
  settingsApi,
} from '../lib/resources';

import {
  normalizeProduct,
  normalizeVariant,
} from '../lib/normalize';

import { getBulkDiscountPerUnit } from '../lib/pricing';

import { ApiError } from '../lib/api';

const StoreContext = createContext(null);

// Used only until the real /settings response arrives (or if it fails) —
// matches the values Setting.js's schema itself defaults to, so behaviour
// is identical to before this was made dynamic.
const DEFAULT_SETTINGS = {
  freeShippingThreshold: 15000,
  flatShippingRate: 15,
  expressShippingRate: 999,
  taxRate: 0,
  taxLabel: 'GST',
  codEnabled: true,
};


/* ============================================================
   CART NORMALIZER
============================================================ */

function normalizeCartItem(item) {
  const product = normalizeProduct(item.product);
  const variant = item.variant
    ? normalizeVariant(item.variant)
    : null;

  return {
    ...product,

    ...(variant && {
      length: variant.length ?? product.length,
      color: variant.color ?? product.color,
      texture: variant.texture ?? product.texture,
      hairType: variant.hairType ?? product.hairType,
      weight: variant.weight ?? product.weight,
      sku: variant.sku ?? product.sku,
      price: variant.price ?? product.price,
      mrp: variant.mrp ?? product.mrp,
      image: variant.image || product.image,
    }),

    variantId: variant?.id || null,
    qty: item.qty,
  };
}


/* ============================================================
   PROVIDER
============================================================ */

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const pendingGuestCart = useRef([]);
  const pendingGuestWishlist = useRef([]);

  /* ============================================================
     SETTINGS (shipping / tax / payment config — admin-editable)
  ============================================================ */

  useEffect(() => {
    let cancelled = false;
    settingsApi
      .get()
      .then((res) => {
        if (!cancelled && res?.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {
        // Keep DEFAULT_SETTINGS — better to fall back to the old hardcoded
        // behaviour than to break checkout if /settings is unreachable.
      });
    return () => {
      cancelled = true;
    };
  }, []);


  /* ============================================================
     TOAST
  ============================================================ */

  const showToast = useCallback(
    (message, type = 'success') => {
      setToast({
        message,
        type,
      });

      window.clearTimeout(showToast._t);

      showToast._t = window.setTimeout(
        () => setToast(null),
        2600
      );
    },
    []
  );


  const showError = useCallback(
    (
      err,
      fallback = 'Something went wrong'
    ) => {
      showToast(
        err instanceof ApiError
          ? err.message
          : fallback,
        'error'
      );
    },
    [showToast]
  );


  /* ============================================================
     SESSION BOOTSTRAP
  ============================================================ */

  useEffect(() => {
    authApi
      .me()
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);


  /* ============================================================
     CART
  ============================================================ */

  const refreshCart = useCallback(async () => {
    try {
      const res = await cartApi.get();

      setCart(
        (res.data?.items || [])
          .map(normalizeCartItem)
      );
    } catch {
      // Guest / unauthenticated user
    }
  }, []);


  /* ============================================================
     WISHLIST
  ============================================================ */

  const refreshWishlist = useCallback(async () => {
    try {
      const res = await wishlistApi.get();

      setWishlist(
        (res.data?.products || [])
          .map(normalizeProduct)
      );
    } catch {
      // Ignore
    }
  }, []);


  useEffect(() => {
    if (!user) return;

    refreshCart();
    refreshWishlist();
  }, [
    user,
    refreshCart,
    refreshWishlist,
  ]);


  /* ============================================================
     GUEST DATA SYNC
  ============================================================ */

  const syncGuestDataToBackend =
    useCallback(async () => {
      for (
        const item of pendingGuestCart.current
      ) {
        await cartApi
          .add(
            item.id,
            item.qty,
            item.variantId
          )
          .catch(() => {});
      }

      for (
        const product of
        pendingGuestWishlist.current
      ) {
        await wishlistApi
          .toggle(product.id)
          .catch(() => {});
      }

      pendingGuestCart.current = [];
      pendingGuestWishlist.current = [];
    }, []);


  /* ============================================================
     LOGIN
  ============================================================ */

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({
        email,
        password,
      });

      setUser(res.user);

      await syncGuestDataToBackend();

      await Promise.all([
        refreshCart(),
        refreshWishlist(),
      ]);

      showToast(
        `Welcome back, ${
          res.user.name?.split(' ')[0] || 'User'
        }!`
      );

      return res.user;
    },
    [
      syncGuestDataToBackend,
      refreshCart,
      refreshWishlist,
      showToast,
    ]
  );


  /* ============================================================
     REGISTER
  ============================================================ */

  const register = useCallback(
    async (payload) => {
      const res =
        await authApi.register(payload);

      setUser(res.user);

      await syncGuestDataToBackend();

      await Promise.all([
        refreshCart(),
        refreshWishlist(),
      ]);

      showToast(
        `Welcome to B.I.R, ${
          res.user.name?.split(' ')[0] || 'User'
        }!`
      );

      return res.user;
    },
    [
      syncGuestDataToBackend,
      refreshCart,
      refreshWishlist,
      showToast,
    ]
  );


  /* ============================================================
     FORGOT PASSWORD
  ============================================================ */

  const forgotPassword =
    useCallback(
      async (email) => {
        const res =
          await authApi.forgotPassword(
            email
          );

        showToast(
          res.message ||
            'If this email is registered, a password reset link has been generated.'
        );

        return res;
      },
      [showToast]
    );


  /* ============================================================
     RESET PASSWORD
  ============================================================ */

  const resetPassword =
    useCallback(
      async (
        token,
        password
      ) => {
        const res =
          await authApi.resetPassword({
            token,
            password,
          });

        showToast(
          res.message ||
            'Password reset successfully'
        );

        return res;
      },
      [showToast]
    );


  /* ============================================================
     LOGOUT
  ============================================================ */

  const logout = useCallback(
    async () => {
      await authApi
        .logout()
        .catch(() => {});

      setUser(null);
      setCart([]);
      setWishlist([]);
      setAppliedCoupon(null);

      showToast('Signed out');
    },
    [showToast]
  );


  /* ============================================================
     CART ACTIONS
  ============================================================ */

  const addToCart = useCallback(
    (
      product,
      qty = 1
    ) => {
      if (user) {
        cartApi
          .add(
            product.id,
            qty,
            product.variantId
          )
          .then((res) => {
            setCart(
              (res.data?.items || [])
                .map(normalizeCartItem)
            );
          })
          .catch((err) =>
            showError(
              err,
              'Could not add to cart'
            )
          );
      } else {
        pendingGuestCart.current.push({
          id: product.id,
          qty,
          variantId:
            product.variantId,
        });

        setCart((prev) => {
          const existing =
            prev.find(
              (i) =>
                i.id === product.id &&
                i.variantId ===
                  product.variantId
            );

          if (existing) {
            return prev.map((i) =>
              i.id === product.id &&
              i.variantId ===
                product.variantId
                ? {
                    ...i,
                    qty:
                      i.qty + qty,
                  }
                : i
            );
          }

          return [
            ...prev,
            {
              ...product,
              qty,
            },
          ];
        });
      }

      showToast(
        `Added "${product.name}" to cart`
      );
    },
    [
      user,
      showToast,
      showError,
    ]
  );


  const removeFromCart =
    useCallback(
      (id) => {
        if (user) {
          cartApi
            .remove(id)
            .then((res) => {
              setCart(
                (res.data?.items || [])
                  .map(normalizeCartItem)
              );
            })
            .catch((err) =>
              showError(
                err,
                'Could not remove item'
              )
            );
        } else {
          setCart((prev) =>
            prev.filter(
              (i) => i.id !== id
            )
          );
        }
      },
      [user, showError]
    );


  const updateQty =
    useCallback(
      (id, qty) => {
        const safeQty =
          Math.max(1, qty);

        if (user) {
          cartApi
            .update(
              id,
              safeQty
            )
            .then((res) => {
              setCart(
                (res.data?.items || [])
                  .map(normalizeCartItem)
              );
            })
            .catch((err) =>
              showError(
                err,
                'Could not update quantity'
              )
            );
        } else {
          setCart((prev) =>
            prev.map((i) =>
              i.id === id
                ? {
                    ...i,
                    qty: safeQty,
                  }
                : i
            )
          );
        }
      },
      [user, showError]
    );


  const clearCart =
    useCallback(
      () => setCart([]),
      []
    );


  /* ============================================================
     COUPON
  ============================================================ */

  const applyCoupon =
    useCallback(
      async (
        code,
        subtotal
      ) => {
        const res =
          await couponsApi.apply(
            code,
            subtotal
          );

        setAppliedCoupon(
          res.data
        );

        showToast(
          `Coupon "${res.data.code}" applied`
        );

        return res.data;
      },
      [showToast]
    );


  const clearCoupon =
    useCallback(
      () =>
        setAppliedCoupon(null),
      []
    );


  /* ============================================================
     WISHLIST
  ============================================================ */

  const toggleWishlist =
    useCallback(
      (product) => {
        if (user) {
          wishlistApi
            .toggle(product.id)
            .then((res) => {
              const products =
                (
                  res.data
                    ?.products || []
                ).map(
                  normalizeProduct
                );

              setWishlist(products);

              const stillIn =
                products.some(
                  (p) =>
                    p.id ===
                    product.id
                );

              showToast(
                stillIn
                  ? `Saved "${product.name}" to wishlist`
                  : `Removed "${product.name}" from wishlist`
              );
            })
            .catch((err) =>
              showError(
                err,
                'Could not update wishlist'
              )
            );
        } else {
          setWishlist((prev) => {
            const exists =
              prev.find(
                (i) =>
                  i.id ===
                  product.id
              );

            if (exists) {
              pendingGuestWishlist.current =
                pendingGuestWishlist.current.filter(
                  (p) =>
                    p.id !==
                    product.id
                );

              showToast(
                `Removed "${product.name}" from wishlist`
              );

              return prev.filter(
                (i) =>
                  i.id !==
                  product.id
              );
            }

            pendingGuestWishlist.current.push(
              product
            );

            showToast(
              `Saved "${product.name}" to wishlist`
            );

            return [
              ...prev,
              product,
            ];
          });
        }
      },
      [
        user,
        showToast,
        showError,
      ]
    );


  /* ============================================================
     CALCULATIONS
  ============================================================ */

  const cartCount =
    useMemo(
      () =>
        cart.reduce(
          (n, i) =>
            n + i.qty,
          0
        ),
      [cart]
    );


  const cartSubtotal =
    useMemo(
      () =>
        cart.reduce(
          (n, i) =>
            n +
            i.price *
              i.qty,
          0
        ),
      [cart]
    );


  const cartMrpTotal =
    useMemo(
      () =>
        cart.reduce(
          (n, i) =>
            n +
            i.mrp *
              i.qty,
          0
        ),
      [cart]
    );


  /** Real per-line bulk/wholesale quantity discount — see lib/pricing.js.
   *  This used to only exist in ProductDetail's marketing table; it now
   *  actually reduces the amount charged, using the exact same tiers. */
  const cartBulkDiscount =
    useMemo(
      () =>
        cart.reduce(
          (n, i) =>
            n + getBulkDiscountPerUnit(i.price, i.qty) * i.qty,
          0
        ),
      [cart]
    );


  /** Subtotal after the bulk-quantity discount, before coupon/shipping/tax. */
  const netSubtotal =
    useMemo(
      () => Math.max(0, cartSubtotal - cartBulkDiscount),
      [cartSubtotal, cartBulkDiscount]
    );


  /** Shipping charge for the given method, read from admin Settings instead
   *  of ever being hardcoded again. Mirrors order.service.js's backend
   *  calculation so what the customer sees matches what they're charged. */
  const getShippingCharge =
    useCallback(
      (method = 'standard') => {
        if (!cart.length) return 0;
        if (method === 'express') {
          return settings.expressShippingRate ?? DEFAULT_SETTINGS.expressShippingRate;
        }
        const threshold = settings.freeShippingThreshold ?? DEFAULT_SETTINGS.freeShippingThreshold;
        const flatRate = settings.flatShippingRate ?? DEFAULT_SETTINGS.flatShippingRate;
        return netSubtotal > threshold ? 0 : flatRate;
      },
      [cart.length, netSubtotal, settings]
    );


  /** Tax for a given taxable amount (post-discount, pre-shipping), read
   *  from admin Settings. Returns 0 whenever no tax rate is configured. */
  const getTax =
    useCallback(
      (taxableAmount) => {
        const rate = settings.taxRate || 0;
        if (!rate) return 0;
        return Math.round((Math.max(0, taxableAmount) * rate) / 100);
      },
      [settings]
    );


  const isWishlisted =
    useCallback(
      (id) =>
        wishlist.some(
          (i) => i.id === id
        ),
      [wishlist]
    );


  /* ============================================================
     CONTEXT VALUE
  ============================================================ */

  const value = {
    user,
    authChecked,

    login,
    register,
    logout,

    forgotPassword,
    resetPassword,

    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,

    cartCount,
    cartSubtotal,
    cartMrpTotal,
    cartBulkDiscount,
    netSubtotal,

    settings,
    getShippingCharge,
    getTax,

    wishlist,
    toggleWishlist,
    isWishlisted,

    appliedCoupon,
    applyCoupon,
    clearCoupon,

    toast,
    showToast,
    showError,
  };


  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}


/* ============================================================
   HOOK
============================================================ */

export function useStore() {
  const ctx =
    useContext(StoreContext);

  if (!ctx) {
    throw new Error(
      'useStore must be used within StoreProvider'
    );
  }

  return ctx;
}