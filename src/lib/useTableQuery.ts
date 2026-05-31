'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type FilterFn = (query: ReturnType<ReturnType<typeof supabase.from>['select']>) => ReturnType<ReturnType<typeof supabase.from>['select']>;

interface UseTableQueryOptions {
  table: string;
  orderBy?: string;
  ascending?: boolean;
  filterFn?: FilterFn;
}

export function useTableQuery<T>({ table, orderBy = 'created_at', ascending = false, filterFn }: UseTableQueryOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select('*');
    if (filterFn) query = filterFn(query);
    const { data: result } = await query.order(orderBy, { ascending });
    setData((result as T[]) || []);
    setLoading(false);
  }, [table, orderBy, ascending, filterFn]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refresh: fetch };
}
