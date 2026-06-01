'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshCw, Maximize2, List, AlertCircle, Trash2, Loader2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import type { OrderFilters } from '@/app/orders/page';

/** Rows per page for server-side pagination. */
const PAGE_SIZE = 20;

/**
 * Optional columns that only exist after running
 * `supabase/orders_filter_columns.sql`. The table probes for them at runtime
 * so the page works whether or not the migration has been applied — filters
 * and display columns light up automatically once the columns exist.
 */
interface OptionalCol {
  key: string;
  label: string;
  date?: boolean;
}

const OPTIONAL_DISPLAY: OptionalCol[] = [
  { key: 'recipient', label: '收件人' },
  { key: 'orderer', label: '下单人' },
  { key: 'store_name', label: '店铺' },
  { key: 'order_type', label: '订单类型' },
  { key: 'submitted_at', label: '提交时间', date: true },
  { key: 'transferred_at', label: '转运时间', date: true },
  { key: 'store_entry_at', label: '入店时间', date: true },
];

const OPTIONAL_COLUMNS = OPTIONAL_DISPLAY.map((c) => c.key);

/** Compact date formatter for table cells. */
function formatCellDate(iso?: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Convert a `YYYY-MM-DD` day string into an ISO half-open range
 * `[start, end)` covering that whole local calendar day. Returns null for
 * empty/invalid input so callers can skip the filter.
 */
function dayRange(day: string): { start: string; end: string } | null {
  if (!day) return null;
  const start = new Date(`${day}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export interface Order {
  id: string | number;
  order_number: string;
  shipping_method: string;
  product_list: string;
  remarks?: string;
  status: string;
  tracking_info: string;
  created_at: string;
  updated_at?: string;
  recipient?: string | null;
  orderer?: string | null;
  store_name?: string | null;
  order_type?: string | null;
  submitted_at?: string | null;
  transferred_at?: string | null;
  store_entry_at?: string | null;
  waybill_path?: string | null;
  waybill_filename?: string | null;
  waybill_uploaded_at?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  '待处理': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  '已提交/待打包': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  '转运中': 'bg-blue-50 text-blue-700 border-blue-200',
  '预刷件': 'bg-purple-50 text-purple-700 border-purple-200',
  '取消中': 'bg-orange-50 text-orange-700 border-orange-200',
  '异常件': 'bg-red-50 text-red-700 border-red-200',
  '待确认入店': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  '已送店': 'bg-green-50 text-green-700 border-green-200',
  '退件重发': 'bg-pink-50 text-pink-700 border-pink-200',
  '已关闭': 'bg-gray-100 text-gray-500 border-gray-200',
};

function statusBadgeClass(status: string): string {
  return STATUS_COLORS[status] ?? 'bg-blue-50 text-blue-600 border-blue-100';
}

interface Props {
  filters: OrderFilters;
  /** Increment to trigger a re-fetch. */
  queryTrigger: number;
  /** Called when user clicks 详情 on a row. */
  onOrderClick: (order: Order) => void;
  /** Currently selected order IDs. */
  selectedIds: string[];
  /** Called when selection changes. */
  onSelectionChange: (ids: string[]) => void;
}

export const OrderTable = ({
  filters,
  queryTrigger,
  onOrderClick,
  selectedIds,
  onSelectionChange,
}: Props) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // 1-based
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  /** Subset of OPTIONAL_COLUMNS that actually exist in the DB (probed once). */
  const [availableCols, setAvailableCols] = useState<string[]>([]);
  const mountedRef = useRef(true);
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  const visibleOptional = OPTIONAL_DISPLAY.filter((c) => availableCols.includes(c.key));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /**
   * Build the filtered orders query. Memoized with availableCols to avoid
   * stale closure issues.
   */
  const buildQuery = useCallback((f: OrderFilters) => {
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });

    // 1) Tab filter → status, unless "所有订单"
    const effectiveStatus = f.status || (f.tab !== '所有订单' ? f.tab : '');
    if (effectiveStatus) {
      query = query.eq('status', effectiveStatus);
    }

    // 2) Search text → match order_number OR tracking_info
    if (f.searchText.trim()) {
      const pattern = `%${f.searchText.trim()}%`;
      query = query.or(
        `order_number.ilike.${pattern},tracking_info.ilike.${pattern}`,
      );
    }

    // 3) Shipping method
    if (f.shippingMethod) {
      query = query.eq('shipping_method', f.shippingMethod);
    }

    // 4) Order ID
    if (f.orderId.trim()) {
      query = query.eq('id', f.orderId.trim());
    }

    // 5) Recipient (name / phone)
    if (f.recipient.trim() && availableCols.includes('recipient')) {
      query = query.ilike('recipient', `%${f.recipient.trim()}%`);
    }

    // 6) Orderer (下单人)
    if (f.orderBy.trim() && availableCols.includes('orderer')) {
      query = query.ilike('orderer', `%${f.orderBy.trim()}%`);
    }

    // 7) Store
    if (f.store && availableCols.includes('store_name')) {
      query = query.eq('store_name', f.store);
    }

    // 8) Order type
    if (f.orderType && availableCols.includes('order_type')) {
      query = query.eq('order_type', f.orderType);
    }

    // 9) Date filters — each input is a single day (YYYY-MM-DD); match the
    //    whole calendar day range [day 00:00, nextDay 00:00).
    //    `created_at` always exists; the rest are guarded by availableCols.
    const dayFilters: Array<[string, string]> = [
      ['created_at', f.fetchTime],
      ['submitted_at', f.submitTime],
      ['transferred_at', f.transferTime],
      ['store_entry_at', f.storeEntryTime],
    ];
    for (const [column, day] of dayFilters) {
      if (column !== 'created_at' && !availableCols.includes(column)) continue;
      const range = dayRange(day);
      if (range) {
        query = query.gte(column, range.start).lt(column, range.end);
      }
    }

    return query;
  }, [availableCols]);

  const fetchOrders = useCallback(async (f: OrderFilters, targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const from = (targetPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const query = buildQuery(f)
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, count, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (mountedRef.current) {
        setOrders(data || []);
        setTotal(count ?? 0);
        // Clear selection when data reloads
        onSelectionChangeRef.current([]);
      }
    } catch (err: unknown) {
      console.error('Supabase fetch error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : '获取订单数据失败';

      if (mountedRef.current) {
        if (errorMessage === 'Failed to fetch') {
          setError(
            '网络请求失败。请检查：1. Supabase URL 是否正确；2. 环境变量是否已设置；3. 网络连接或是否被插件拦截。',
          );
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [buildQuery]);

  // A new query (search / tab change / clear) resets to the first page; a page
  // change re-fetches that page. Both are handled in one effect to avoid a
  // double fetch when resetting the page.
  const lastTriggerRef = useRef(queryTrigger);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    mountedRef.current = true;

    if (lastTriggerRef.current !== queryTrigger) {
      lastTriggerRef.current = queryTrigger;
      if (page !== 1) {
        setPage(1); // will re-run this effect with page === 1
        return () => {
          mountedRef.current = false;
        };
      }
    }

    fetchOrders(filtersRef.current, page);
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTrigger, page, fetchOrders]);

  // Probe once on mount which optional columns exist in the DB.
  // Use a single query selecting all optional columns; columns that don't exist
  // will cause an error, so we fall back to individual probes only if needed.
  useEffect(() => {
    let active = true;
    (async () => {
      // Try selecting all optional columns at once
      const allCols = OPTIONAL_COLUMNS.join(',');
      const { error: bulkErr } = await supabase
        .from('orders')
        .select(allCols)
        .limit(1);

      if (!active) return;

      if (!bulkErr) {
        // All columns exist
        setAvailableCols([...OPTIONAL_COLUMNS]);
      } else {
        // Fallback: probe individually
        const results = await Promise.all(
          OPTIONAL_COLUMNS.map(async (col) => {
            const { error } = await supabase.from('orders').select(col).limit(1);
            return error ? null : col;
          }),
        );
        if (active) {
          setAvailableCols(results.filter((c): c is string => c !== null));
        }
      }
    })();
    return () => { active = false; };
  }, []);

  // ---- Checkbox helpers ----
  const allVisibleIds = orders.map((o) => String(o.id));
  const allSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));
  const someSelected =
    !allSelected && allVisibleIds.some((id) => selectedIds.includes(id));

  const handleHeaderCheckbox = () => {
    if (allSelected) {
      // Deselect all visible
      onSelectionChange(selectedIds.filter((id) => !allVisibleIds.includes(id)));
    } else {
      // Select all visible (merge with any already selected from other pages)
      const merged = Array.from(new Set([...selectedIds, ...allVisibleIds]));
      onSelectionChange(merged);
    }
  };

  const handleRowCheckbox = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  /** 单行删除 */
  const handleDeleteRow = async (id: string) => {
    setDeletingId(id);
    try {
      // 用 select() 让 Supabase 返回被删除的行，
      // 若 RLS 拦截则返回空数组而非报错，可以此判断是否真正删除
      const { data: deleted, error: delError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .select('id');

      if (delError) throw delError;

      if (!deleted || deleted.length === 0) {
        throw new Error(
          '删除被拒绝（RLS 策略限制）。请在 Supabase 控制台执行 supabase/fix_orders_rls.sql 修复权限。',
        );
      }

      if (mountedRef.current) {
        // Re-fetch the current page so the total count stays accurate and any
        // row from the next page shifts up to fill the gap. If this was the
        // last row on a page beyond the first, step back a page.
        onSelectionChange(selectedIds.filter((s) => s !== id));
        if (orders.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          fetchOrders(filters, page);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '删除失败';
      toast('删除失败：' + msg, 'error');
    } finally {
      if (mountedRef.current) {
        setDeletingId(null);
        setConfirmDeleteId(null);
      }
    }
  };

  const columns = [
    '订单编号', '物流方式', '商品清单', '备注/留言', '操作', '状态&打包状态', '货况信息',
    ...visibleOptional.map((c) => c.label),
  ];

  /** Total column count incl. the leading checkbox column (for empty/loading colSpan). */
  const colSpan = columns.length + 1;

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden min-h-[400px]">
      {/* Table Toolbar */}
      <div className="flex justify-between items-center p-2 bg-gray-50 border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          {error && (
            <div className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-100">
              <AlertCircle className="w-3 h-3" />
              <span>错误: {error}</span>
            </div>
          )}
          {!loading && !error && (
            <span className="text-xs text-gray-400">
              共 {total} 条
              {totalPages > 1 && (
                <span className="ml-1">
                  · 第 {page}/{totalPages} 页
                </span>
              )}
              {selectedIds.length > 0 && (
                <span className="ml-2 text-[#3c8dbc] font-medium">
                  已选 {selectedIds.length} 条
                </span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders(filters, page)}
            disabled={loading}
            className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="刷新数据"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
            <List className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#f9fafb] text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 border-r border-gray-200 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 cursor-pointer"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={handleHeaderCheckbox}
                  aria-label="全选"
                />
              </th>
              {columns.map((col, idx) => (
                <th
                  key={col}
                  className={`px-4 py-3 border-r border-gray-200 last:border-r-0 ${idx === 2 ? 'w-1/4' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="animate-pulse">正在从 Supabase 获取订单…</span>
                  </div>
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => {
                const rowId = String(order.id);
                const isSelected = selectedIds.includes(rowId);
                return (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="px-4 py-3 border-r border-gray-200">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 cursor-pointer"
                        checked={isSelected}
                        onChange={() => handleRowCheckbox(rowId)}
                        aria-label={`选择订单 ${order.order_number}`}
                      />
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 font-medium text-blue-600">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200">
                      {order.shipping_method}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 truncate max-w-[200px]">
                      {order.product_list}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 italic text-gray-400">
                      {order.remarks || '-'}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOrderClick(order)}
                          className="text-[#3c8dbc] hover:text-[#367fa9] font-bold hover:underline text-sm"
                        >
                          详情
                        </button>
                        <span className="text-gray-200">|</span>
                        {confirmDeleteId === rowId ? (
                          <span className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteRow(rowId)}
                              disabled={deletingId === rowId}
                              className="text-red-500 hover:text-red-700 text-xs font-bold"
                            >
                              {deletingId === rowId ? (
                                <Loader2 className="w-3 h-3 animate-spin inline" />
                              ) : '确认'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                              取消
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(rowId)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="删除此订单"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200">
                      <span
                        className={`px-2 py-0.5 rounded border text-[11px] font-bold ${statusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 text-xs text-gray-500 font-mono tracking-tight">
                      {order.tracking_info || '暂无物流信息'}
                    </td>
                    {visibleOptional.map((c) => {
                      const raw = (order as unknown as Record<string, unknown>)[c.key] as
                        | string
                        | null
                        | undefined;
                      const display = c.date ? formatCellDate(raw) : raw || '-';
                      return (
                        <td
                          key={c.key}
                          className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-xs text-gray-600 whitespace-nowrap"
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={colSpan} className="px-4 py-20 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-gray-100 p-4 rounded-full">
                      <List className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 font-medium">
                        没有找到匹配的记录
                      </span>
                      <span className="text-xs">
                        请确保 Supabase 中 `orders` 表有数据且已开启 RLS 权限。
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
          <span>
            第 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} 条 / 共 {total} 条
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="首页"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="上一页"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="下一页"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="末页"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
