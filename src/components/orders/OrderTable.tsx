'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Maximize2, List, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { OrderFilters } from '@/app/orders/page';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchOrders = async (f: OrderFilters) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('orders').select('*');

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

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (mountedRef.current) {
        setOrders(data || []);
        // Clear selection when data reloads
        onSelectionChange([]);
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
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders(filters);
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTrigger]);

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
        setOrders((prev) => prev.filter((o) => String(o.id) !== id));
        onSelectionChange(selectedIds.filter((s) => s !== id));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '删除失败';
      alert('删除失败：' + msg);
    } finally {
      if (mountedRef.current) {
        setDeletingId(null);
        setConfirmDeleteId(null);
      }
    }
  };

  const columns = [
    '订单编号', '物流方式', '商品清单', '备注/留言', '操作', '状态&打包状态', '货况信息',
  ];

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
              共 {orders.length} 条
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
            onClick={() => fetchOrders(filters)}
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
                <td colSpan={8} className="px-4 py-20 text-center">
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
                    <td className="px-4 py-3 border-r border-gray-200 font-medium text-blue-600 cursor-pointer hover:underline">
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
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-20 text-center text-gray-400">
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
    </div>
  );
};
