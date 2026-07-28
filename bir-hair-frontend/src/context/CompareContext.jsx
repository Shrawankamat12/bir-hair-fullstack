import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CompareContext = createContext(null);
const STORAGE_KEY = 'bir_compare_v1';
const MAX_COMPARE = 4;

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }) {
  const [items, setItems] = useState(readStored);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — feature degrades gracefully
    }
  }, [items]);

  const isComparing = useCallback((id) => items.some((p) => p.id === id), [items]);

  const toggleCompare = useCallback((product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  }, []);

  const removeCompare = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearCompare = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items, isComparing, toggleCompare, removeCompare, clearCompare,
    drawerOpen, setDrawerOpen, maxCompare: MAX_COMPARE,
  }), [items, isComparing, toggleCompare, removeCompare, clearCompare, drawerOpen]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
