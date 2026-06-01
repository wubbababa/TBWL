'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;
type FilterFn = (query: QueryBuilder) => QueryBuilder;

interface UseTableQueryOptions {
  table: string;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
  filterFn?: FilterFn;
  /** Debounce delay in ms when filterFn changes (default: 300) */
  debounce?: number;
}

interface UseTableQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  refresh: () => void;
}

export function useTableQuery<T>({
  table,
  pageSize = 20,
  orderBy = 'created_at',
  ascending = false,
  filterFn,
  debounce = 300,
}: UseTableQueryOptions): UseTableQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const mountedRef = useRef(true);
  const prevFilterRef = useRef(filterFn);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isFirstFetch = useRef(true);
  const fetchIdRef = useRef(0);

  // 当 filterFn 引用变化时（筛选条件改变），自动重置到第 1 页
  if (prevFilterRef.current !== filterFn) {
    prevFilterRef.current = filterFn;
    if (page !== 1) setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchData = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(table).select('*', { count: 'exact' });
      if (filterFn) query = filterFn(query);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: result, count, error: fetchError } = await query
        .order(orderBy, { ascending })
        .range(from, to);

      if (fetchError) throw fetchError;
      // Only apply result if this is still the latest request
      if (mountedRef.current && fetchId === fetchIdRef.current) {
        setData((result as T[]) || []);
        setTotal(count ?? 0);
      }
    } catch (err: unknown) {
      if (mountedRef.current && fetchId === fetchIdRef.current) {
        setError(err instanceof Error ? err.message : '数据加载失败');
      }
    } finally {
      if (mountedRef.current && fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [table, pageSize, orderBy, ascending, filterFn, page]);

  // Fetch with debounce (skip debounce on first load and manual refresh)
  useEffect(() => {
    mountedRef.current = true;

    if (isFirstFetch.current) {
      isFirstFetch.current = false;
      fetchData();
    } else if (debounce > 0) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(fetchData, debounce);
    } else {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(debounceRef.current);
    };
  }, [fetchData, debounce, refreshKey]);

  const refresh = useCallback(() => {
    clearTimeout(debounceRef.current);
    isFirstFetch.current = true; // skip debounce on refresh
    setPage(1);
    setRefreshKey(k => k + 1);
  }, []);

  return { data, loading, error, total, page, totalPages, setPage, refresh };
}
