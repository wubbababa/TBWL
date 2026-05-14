'use client';

import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, ShoppingCart, RotateCcw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AbnormalParcel {
  id: string;
  tracking_number: string;
  order_number: string;
  abnormal_type: string;
  process_action: string | null;
  idle_days: number;
  processed_at: string | null;
  created_at: string;
}

export default function AbnormalParcelsPage() {
  const [parcels, setParcels] = useState<AbnormalParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingFilter, setTrackingFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');

  const fetchParcels = async () => {
    setLoading(true);
    let query = supabase.from('abnormal_parcels').select('*');
    if (trackingFilter) query = query.ilike('tracking_number', `%${trackingFilter}%`);
    if (orderFilter) query = query.ilike('order_number', `%${orderFilter}%`);
    const { data } = await query.order('created_at', { ascending: false });
    setParcels(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchParcels(); }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-gray-500 text-[13px] space-y-2 bg-transparent px-1 font-medium italic">
        <p>1.請盡快處理異常的快遞包裹,系統將會自動清空壹個月之前的所有異常記錄數據.</p>
        <p>2.如不及時處理異常信息產生後的后果将由自己承担</p>
        <p>3.超過30天後還未處理的異常快遞包裹，倉庫即做销毁處理，不予任何查找或理赔</p>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">异常包裹处理中心</h1>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchParcels}
          />
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-start">
            <input type="text" placeholder="快递单号" value={trackingFilter} onChange={e => setTrackingFilter(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="订单编号" value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="时间" className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={fetchParcels} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button onClick={() => { setTrackingFilter(''); setOrderFilter(''); }} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <RotateCcw className="w-4 h-4" /><span>返回列表</span>
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-red-600 text-[12px] font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>請搜索完整的快遞單號，或者訂單編號</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3"><div className="flex flex-col"><span>快递包裹</span><span>订单编号</span></div></th>
                <th className="px-4 py-3 whitespace-nowrap">异常类型</th>
                <th className="px-4 py-3 whitespace-nowrap">处理</th>
                <th className="px-4 py-3 whitespace-nowrap">创建时间</th>
                <th className="px-4 py-3 whitespace-nowrap">包裹闲置时长</th>
                <th className="px-4 py-3 whitespace-nowrap">处理时间</th>
                <th className="px-4 py-3 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : parcels.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">暂无异常包裹记录</td></tr>
              ) : parcels.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-left"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-xs text-gray-600">{p.tracking_number || '-'}</span>
                      <span className="text-xs text-blue-600">{p.order_number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[11px] font-bold">{p.abnormal_type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.process_action || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-3 text-red-500 font-medium">{p.idle_days}天</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.processed_at ? new Date(p.processed_at).toLocaleDateString('zh-CN') : '-'}</td>
                  <td className="px-4 py-3"><button className="text-blue-600 hover:underline text-xs font-bold">处理</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs italic">共{parcels.length}条记录</span></div>
        </div>
      </div>
    </div>
  );
}
