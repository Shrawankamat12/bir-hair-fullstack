import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Generic "fetch on mount / on deps change" hook.
 * Returns { data, loading, error, refetch } — every page-level list/detail
 * fetch in the storefront is built on this so loading/error/empty handling
 * stays consistent everywhere instead of being hand-rolled per page.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: undefined, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: undefined, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { ...state, refetch: run };
}
