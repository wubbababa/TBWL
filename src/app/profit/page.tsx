'use client';

import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Maximize, LayoutGrid, ExternalLink, ChevronDown, Calendar, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const [rows, setRows] = useState<OrderProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOrder, setSearchOrder] = useState('');

  const fetchRows = async () => {
    setLoading(true);
    let query = supabase.from('order_profit').select('*');
    if (searchOrder) query = query.ilike('order_number', `%${searchOrder}%`);
    const { data } = await query.order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const sum = (key: keyof OrderProfit) =>
    rows.reduce((acc, r) => acc + Number(r[key] ?? 0), 0).toFixed(2);

  const stats = [
    { label: '实付金额/CNY', value: sum('paid_amount') },
    { label: '订单收入/CNY', value: sum('order_income') },
    { label: '采购成本/CNY', value: sum('purchase_cost') },
    { label: '库存成本/CNY', value: sum('inventory_cost') },
    { label: '货代成本/CNY', value: sum('freight_cost') },
    { label: '实际收入/CNY', value: sum('actual_income') },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-800">订单利润</h1>
            <RefreshCw
              className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
              onClick={fetchRows}
            />
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

      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
            <div className="lg:col-span-2">
              <input type="text" placeholder="订单编号" value={searchOrder} onChange={e => setSearchOrder(e.target.value)}
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
              <button onClick={fetchRows} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button className="flex items-center gap-1.5 h-9 px-4 bg-[#00a65a] text-white text-sm rounded hover:bg-[#008d4c] border border-[#008d4c]">
                <Database className="w-4 h-4" /><span>更新缓存</span>
              </button>
              <div className="flex border border-gray-300 rounded overflow-hidden ml-auto lg:ml-0">
                <button onClick={fetchRows} className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200"><RefreshCw className="w-4 h-4 text-gray-600" /></button>
                <button className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200"><Maximize className="w-4 h-4 text-gray-600" /></button>
                <button className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200"><LayoutGrid className="w-4 h-4 text-gray-600" /></button>
                <button className="p-2 bg-white hover:bg-gray-50"><ExternalLink className="w-4 h-4 text-gray-600" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3 whitespace-nowrap">订单编号</th>
                <th className="px-4 py-3 whitespace-nowrap">销售金额(TWD)</th>
                <th className="px-4 py-3 whitespace-nowrap">实付金额(TWD)</th>
                <th className="px-4 py-3 whitespace-nowrap">其它费用(TWD)</th>
                <th className="px-4 py-3 whitespace-nowrap">物流成本(TWD)</th>
                <th className="px-4 py-3 whitespace-nowrap">订单收入(TWD/CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap">采购成本(CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap">库存成本(CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap">货代成本(CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap">实际收入(CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={12} className="px-4 py-8 text-center text-gray-500">没有找到匹配的记录</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-blue-600 text-xs font-mono">{r.order_number}</td>
                  <td className="px-4 py-3">{r.sales_amount}</td>
                  <td className="px-4 py-3">{r.paid_amount}</td>
                  <td className="px-4 py-3">{r.other_fees}</td>
                  <td className="px-4 py-3">{r.logistics_cost}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{r.order_income}</td>
                  <td className="px-4 py-3">{r.purchase_cost}</td>
                  <td className="px-4 py-3">{r.inventory_cost}</td>
                  <td className="px-4 py-3">{r.freight_cost}</td>
                  <td className="px-4 py-3 font-bold text-green-600">{r.actual_income}</td>
                  <td className="px-4 py-3 text-center"><button className="text-blue-600 hover:underline text-xs font-bold">详情</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs">共{rows.length}条记录</span></div>
        </div>
      </div>
    </div>
  );
}
