'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, RefreshCw, ChevronDown, Calendar, Database } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';
import { DetailModal } from '@/components/ui/DetailModal';

interface OrderProfit {
  id: string;
  order_number: string;
  sales_amount: number;
  paid_amount: number;
  other_fees: number;
  logistics_cost: number;
  order_income: number;
  purchase_cost: number;
  inventory_cost: number;
  freight_cost: number;
  actual_income: number;
  created_at: string;
}

export default function OrderProfitPage() {
  const [searchOrder, setSearchOrder] = useState('');
  const [detailRow, setDetailRow] = useState<OrderProfit | null>(null);

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (searchOrder) q = q.ilike('order_number', `%${searchOrder}%`);
    return q;
  }, [searchOrder]);

  const { data: rows, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<OrderProfit>({
    table: 'order_profit',
    filterFn,
  });

  const stats = useMemo(() => {
    const sum = (key: keyof OrderProfit) =>
      rows.reduce((acc, r) => acc + Number(r[key] ?? 0), 0).toFixed(2);
    return [
      { label: '实付金额/CNY', value: sum('paid_amount') },
      { label: '订单收入/CNY', value: sum('order_income') },
      { label: '采购成本/CNY', value: sum('purchase_cost') },
      { label: '库存成本/CNY', value: sum('inventory_cost') },
      { label: '货代成本/CNY', value: sum('freight_cost') },
      { label: '实际收入/CNY', value: sum('actual_income') },
    ];
  }, [rows]);

  const columns: Column<OrderProfit>[] = [
    { key: 'order_number', title: '订单编号', render: r => <span className="text-blue-600 text-xs font-mono">{r.order_number}</span> },
    { key: 'sales_amount', title: '销售金额(CNY)' },
    { key: 'paid_amount', title: '实付金额(CNY)' },
    { key: 'other_fees', title: '其它费用(CNY)' },
    { key: 'logistics_cost', title: '物流成本(CNY)' },
    { key: 'order_income', title: '订单收入(CNY)', render: r => <span className="font-bold text-blue-600">{r.order_income}</span> },
    { key: 'purchase_cost', title: '采购成本(CNY)' },
    { key: 'inventory_cost', title: '库存成本(CNY)' },
    { key: 'freight_cost', title: '货代成本(CNY)' },
    { key: 'actual_income', title: '实际收入(CNY)', render: r => <span className="font-bold text-green-600">{r.actual_income}</span> },
    { key: 'action', title: '操作', className: 'text-center', render: (r) => <button className="text-blue-600 hover:underline text-xs font-bold" onClick={() => setDetailRow(r)}>详情</button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-800">订单利润</h1>
            <RefreshCw className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} onClick={refresh} />
            <span className="text-red-500 text-xs font-medium ml-2">默认只统计前三个月的订单数据</span>
          </div>
        </div>
        <div className="p-8 grid grid-cols-2 lg:grid-cols-6 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-sm text-gray-700 font-medium mb-3">{s.label}</span>
              <span className="text-4xl font-bold text-gray-800 tracking-tight">{loading ? '...' : s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card flex flex-col">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
            <div className="lg:col-span-2">
              <input type="text" placeholder="订单编号" value={searchOrder} onChange={e => setSearchOrder(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && refresh()}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            </div>
            <div className="relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="">选择店铺</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="lg:col-span-2 relative">
              <input type="text" placeholder="订单创建时间" className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none cursor-pointer" />
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2 lg:col-span-2">
              <button onClick={refresh} className="flex items-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9] border border-[#367fa9] shadow-sm">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button className="flex items-center gap-1.5 h-9 px-4 bg-[#00a65a] text-white text-sm rounded hover:bg-[#008d4c] border border-[#008d4c] shadow-sm">
                <Database className="w-4 h-4" /><span>更新缓存</span>
              </button>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={rows} loading={loading} error={error} emptyText="没有找到匹配的记录"
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>

      {detailRow && (
        <DetailModal
          title="订单利润详情"
          onClose={() => setDetailRow(null)}
          fields={[
            { label: '订单编号', value: detailRow.order_number },
            { label: '销售金额', value: `¥${detailRow.sales_amount}` },
            { label: '实付金额', value: `¥${detailRow.paid_amount}` },
            { label: '其它费用', value: `¥${detailRow.other_fees}` },
            { label: '物流成本', value: `¥${detailRow.logistics_cost}` },
            { label: '订单收入', value: `¥${detailRow.order_income}` },
            { label: '采购成本', value: `¥${detailRow.purchase_cost}` },
            { label: '库存成本', value: `¥${detailRow.inventory_cost}` },
            { label: '货代成本', value: `¥${detailRow.freight_cost}` },
            { label: '实际收入', value: `¥${detailRow.actual_income}` },
            { label: '创建时间', value: new Date(detailRow.created_at).toLocaleString('zh-CN') },
          ]}
        />
      )}
    </div>
  );
}
