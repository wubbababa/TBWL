'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RefreshCw, ShoppingCart, ChevronLeft } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';

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
  const router = useRouter();
  const [productIdFilter, setProductIdFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (productIdFilter) q = q.ilike('product_id', `%${productIdFilter}%`);
    if (orderFilter) q = q.ilike('order_number', `%${orderFilter}%`);
    if (skuFilter) q = q.ilike('sku', `%${skuFilter}%`);
    return q;
  }, [productIdFilter, orderFilter, skuFilter]);

  const { data: records, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<InventoryRecord>({
    table: 'inventory_records',
    filterFn,
  });

  const columns: Column<InventoryRecord>[] = [
    { key: 'product_id', title: '商品ID', className: 'text-center', render: r => <span className="font-mono text-xs text-blue-600">{r.product_id ? r.product_id.slice(0, 8) : '-'}</span> },
    { key: 'order_number', title: '订单编号', className: 'text-center', render: r => <span className="text-blue-600 text-xs">{r.order_number || '-'}</span> },
    { key: 'sku', title: 'SKU/商品名', className: 'text-center', render: r => <span className="text-gray-700">{r.sku || '-'}</span> },
    { key: 'quantity', title: '调用数量', className: 'text-center', render: r => <span className="font-bold text-gray-800">{r.quantity}</span> },
    { key: 'description', title: '描述', className: 'text-center', render: r => <span className="text-gray-500 text-xs">{r.description || '-'}</span> },
    { key: 'created_at', title: '创建时间', className: 'text-center', render: r => <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleString('zh-CN')}</span> },
    { key: 'status', title: '状态', className: 'text-center', render: r => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.status === '已完成' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{r.status}</span>
    )},
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
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
              <button onClick={refresh} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button onClick={() => router.back()} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" /><span>返回</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">调用记录</h2>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={refresh}
          />
        </div>
        <DataTable columns={columns} data={records} loading={loading} error={error} emptyText="暂无调用记录" checkbox={false}
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>
    </div>
  );
}
