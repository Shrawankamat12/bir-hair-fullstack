import { useCallback, useEffect, useMemo, useState } from 'react';
import useDebounce from './useDebounce.js';

/**
 * Drives an entire List page: fetching, client-side search/sort/pagination
 * fallback (works even before the backend supports query params), selection
 * for bulk actions, and create/update/remove/bulkRemove/bulkUpdate against
 * any service built with crudFactory().
 *
 * Works defensively: if the backend endpoint isn't available yet, `rows`
 * stays an empty array and `error` is set instead of throwing, so every
 * page renders its empty state instead of a blank screen.
 */
export default function useEntityList(api, { pageSize = 10, initialFilters = {}, searchKeys = [] } = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const debouncedQuery = useDebounce(query, 300);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAll();
      const list = Array.isArray(data) ? data : data?.items || data?.data || data?.results || [];
      setRows(list);
    } catch (err) {
      setRows([]);
      setError(err?.response?.data?.message || 'Could not load data from the server.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => setPage(1), [debouncedQuery, filters]);

  const filtered = useMemo(() => {
    let list = [...rows];

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase();
      const keys = searchKeys.length ? searchKeys : Object.keys(list[0] || {});
      list = list.filter((row) => keys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)));
    }

    Object.entries(filters).forEach(([key, val]) => {
      if (val === '' || val === undefined || val === 'all') return;
      list = list.filter((row) => String(row[key]) === String(val));
    });

    if (sort.key) {
      list.sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
        return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }

    return list;
  }, [rows, debouncedQuery, filters, sort, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleSelectAll = () => setSelected((s) => (s.length === paged.length ? [] : paged.map((r) => r._id || r.id)));
  const clearSelection = () => setSelected([]);

  const create = async (payload) => { const res = await api.create(payload); await load(); return res; };
  const update = async (id, payload) => { const res = await api.update(id, payload); await load(); return res; };
  const remove = async (id) => { await api.remove(id); await load(); };
  const bulkRemove = async (ids = selected) => { await Promise.all(ids.map((id) => api.remove(id))); clearSelection(); await load(); };
  const bulkUpdateStatus = async (status, ids = selected) => {
    await Promise.all(ids.map((id) => api.update(id, { status })));
    clearSelection();
    await load();
  };

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  return {
    rows: paged, allFiltered: filtered, allRows: rows, loading, error, reload: load,
    query, setQuery, filters, setFilters, sort, toggleSort,
    page: currentPage, totalPages, setPage, pageSize, totalItems: filtered.length,
    selected, toggleSelect, toggleSelectAll, clearSelection,
    create, update, remove, bulkRemove, bulkUpdateStatus,
  };
}
