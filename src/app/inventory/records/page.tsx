'use client';

import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, ShoppingCart, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InventoryRecord {
  id: string;
  product_id: string | null;
  order_number: string | null;
  sku: string | null;
  quantity: number;
  description: string | null;
  status: string;
  created_at: string;
}

export default function InventoryRecordsPage() {
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [productIdFilter, setProductIdFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    let query = supabase.from('inventory_records').select('*');
    if (productIdFilter) query = query.ilike('product_id', `%${productIdFilter}%`);
    if (orderFilter) query = query.ilike('order_number', `%${orderFilter}%`);
    if (skuFilter) query = query.ilike('sku', `%${skuFilter}%`);
    const { data } = await query.order('created_at', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">库存调用记录</h1>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input type="text" placeholder="商品ID" value={productIdFilter} onChange={e => setProductIdFilter(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="订单编号" value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="SKU/商品名" value={skuFilter} onChange={e => setSkuFilter(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={fetchRecords} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" /><span>返回</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">调用记录</h2>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchRecords}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">商品ID</th>
                <th className="px-4 py-3 whitespace-nowrap">订单编号</th>
                <th className="px-4 py-3 whitespace-nowrap">SKU/商品名</th>
                <th className="px-4 py-3 whitespace-nowrap">调用数量</th>
                <th className="px-4 py-3 whitespace-nowrap">描述</th>
                <th className="px-4 py-3 whitespace-nowrap">创建时间</th>
                <th className="px-4 py-3 whitespace-nowrap">状态</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无调用记录</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.product_id ? r.product_id.slice(0, 8) : '-'}</td>
                  <td className="px-4 py-3 text-blue-600 text-xs">{r.order_number || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{r.sku || '-'}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{r.quantity}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.description || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.status === '已完成' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs italic">共{records.length}条记录</span></div>
        </div>
      </div>
    </div>
  );
}
