'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, Search, RefreshCw, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ReturnParcel {
  id: string;
  tracking_number: string;
  original_order: string | null;
  reason: string;
  status: string;
  returned_at: string;
}

const statusStyle = (s: string) => {
  if (s === '待处理') return 'bg-yellow-50 text-yellow-600 border-yellow-100';
  if (s === '已收到') return 'bg-blue-50 text-blue-600 border-blue-100';
  if (s === '已重发') return 'bg-green-50 text-green-600 border-green-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

export default function ReturnedParcelsPage() {
  const [returns, setReturns] = useState<ReturnParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingFilter, setTrackingFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReturns = async () => {
    setLoading(true);
    let query = supabase.from('returns').select('*');
    if (trackingFilter) query = query.ilike('tracking_number', `%${trackingFilter}%`);
    if (orderFilter) query = query.ilike('original_order', `%${orderFilter}%`);
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data } = await query.order('returned_at', { ascending: false });
    setReturns(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReturns(); }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">退件包裹管理</h1>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchReturns}
          />
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <input type="text" placeholder="物流单号" value={trackingFilter} onChange={e => setTrackingFilter(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="原订单号" value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer text-gray-500">
                <option value="">退件状态</option>
                <option value="待处理">待处理</option>
                <option value="已收到">已收到</option>
                <option value="已重发">已重发</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button onClick={fetchReturns} className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9]">
              <Search className="w-4 h-4" /><span>查询</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3">物流单号</th>
                <th className="px-4 py-3">原订单号</th>
                <th className="px-4 py-3">退件原因</th>
                <th className="px-4 py-3">当前状态</th>
                <th className="px-4 py-3">退回日期</th>
                <th className="px-4 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">暂无退件包裹记录</td></tr>
              ) : returns.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 font-mono text-gray-700">{r.tracking_number}</td>
                  <td className="px-4 py-3 text-blue-600">{r.original_order || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.returned_at).toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-3 text-center"><button className="text-blue-600 hover:underline text-xs font-bold">处理</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs">共{returns.length}条记录</span></div>
        </div>
      </div>
    </div>
  );
}
