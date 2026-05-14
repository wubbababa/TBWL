'use client';

import React, { useEffect, useState } from 'react';
import { Package, Search, RefreshCw, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UnassociatedParcel {
  id: string;
  tracking_number: string;
  weight: number | null;
  volume: number | null;
  status: string;
  inbound_at: string;
}

export default function UnassociatedParcelsPage() {
  const [parcels, setParcels] = useState<UnassociatedParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingFilter, setTrackingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchParcels = async () => {
    setLoading(true);
    let query = supabase.from('unassociated_parcels').select('*');
    if (trackingFilter) query = query.ilike('tracking_number', `%${trackingFilter}%`);
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data } = await query.order('inbound_at', { ascending: false });
    setParcels(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchParcels(); }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">未关联包裹</h1>
        </div>
        <div className="p-4 flex flex-wrap gap-2 text-sm text-gray-500">
          这里的包裹尚未与订单关联，请核对信息后进行关联操作。
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">包裹列表</h2>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchParcels}
          />
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <input
              type="text"
              placeholder="物流单号"
              value={trackingFilter}
              onChange={e => setTrackingFilter(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none"
            />
            <input type="text" placeholder="入库批次" className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer text-gray-500"
              >
                <option value="">包裹状态</option>
                <option value="待关联">待关联</option>
                <option value="核对中">核对中</option>
                <option value="已关联">已关联</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={fetchParcels} className="flex items-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9]">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button onClick={() => { setTrackingFilter(''); setStatusFilter(''); }} className="h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">重置</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3 whitespace-nowrap">物流单号</th>
                <th className="px-4 py-3 whitespace-nowrap">入库时间</th>
                <th className="px-4 py-3 whitespace-nowrap">重量(kg)</th>
                <th className="px-4 py-3 whitespace-nowrap">体积(m³)</th>
                <th className="px-4 py-3 whitespace-nowrap">状态</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : parcels.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">没有找到未关联的包裹记录</td></tr>
              ) : parcels.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 font-mono text-gray-700">{p.tracking_number}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.inbound_at).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3">{p.weight ?? '-'}</td>
                  <td className="px-4 py-3">{p.volume ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.status === '待关联' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : p.status === '核对中' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center"><button className="text-blue-600 hover:underline text-xs font-bold">关联</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs">共{parcels.length}条记录</span></div>
        </div>
      </div>
    </div>
  );
}
