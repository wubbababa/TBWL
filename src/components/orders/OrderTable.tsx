'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Maximize2, List, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { OrderFilters } from '@/app/orders/page';

interface Order {
  id: string | number;
  order_number: string;
  shipping_method: string;
  product_list: string;
  remarks?: string;
  status: string;
  tracking_info: string;
  created_at: string;
}

interface Props {
  filters: OrderFilters;
  /** Increment to trigger a re-fetch. */
  queryTrigger: number;
}

export const OrderTable = ({ filters, queryTrigger }: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      }
    } catch (err: any) {
      console.error('Supabase fetch error:', err);
      const errorMessage =
        err.message || (typeof err === 'string' ? err : '获取订单数据失败');

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
                <input type="checkbox" className="rounded border-gray-300" />
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
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 border-r border-gray-200">
                    <input type="checkbox" className="rounded border-gray-300" />
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
                    <button className="text-blue-500 hover:text-blue-700 font-bold">
                      详情
                    </button>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 text-[11px] font-bold uppercase">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-xs text-gray-500 font-mono tracking-tight">
                    {order.tracking_info || '暂无物流信息'}
                  </td>
                </tr>
              ))
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
