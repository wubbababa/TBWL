'use client';

import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, PackageSearch, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UnassociatedParcel {
  id: string;
  tracking_number: string;
  status: string;
  inbound_at: string;
  idle_days?: number;
}

export default function ParcelClaimPage() {
  const [parcels, setParcels] = useState<UnassociatedParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingFilter, setTrackingFilter] = useState('');

  const fetchParcels = async () => {
    setLoading(true);
    let query = supabase.from('unassociated_parcels').select('*');
    if (trackingFilter) query = query.eq('tracking_number', trackingFilter);
    const { data } = await query.order('inbound_at', { ascending: false });
    setParcels(data || []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchParcels(); }, []);

  // 用 state 存储当前时间，避免 render 中调用 Date.now() 触发 purity 规则
  const [now] = useState(() => Date.now());

  // 计算闲置时长（小时）
  const getIdleHours = (inboundAt: string) => {
    const diff = now - new Date(inboundAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  };

  const getIdleDays = (inboundAt: string) => {
    return Math.floor(getIdleHours(inboundAt) / 24);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-transparent text-[13px] text-gray-500 leading-relaxed px-1">
        <p>1.包裹認領:指寄到倉庫的快遞包裹没有绑定快递也不是入库快递, 倉庫無法識別是誰的包裹, 稱之為&ldquo;無主件&rdquo;</p>
        <p>2.倉庫會將&ldquo;無主件&rdquo;進行公示, 您可以通過输入完整的快遞单号校验, 校驗正確後則可以點擊認領</p>
        <p>3.無主件倉庫會进行公示30天, 30天後無人認領, 倉庫即做銷毀處理, 不予任何查找或理賠</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <PackageSearch className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">包裹認領</h1>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchParcels}
          />
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-3 items-center">
            <input type="text" placeholder="输入您的快遞單號" value={trackingFilter} onChange={e => setTrackingFilter(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="时间" className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={fetchParcels} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button onClick={() => { setTrackingFilter(''); fetchParcels(); }} className="h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">返回列表</button>
              <button className="flex items-center gap-1.5 h-9 px-4 bg-[#222d32] text-white text-sm rounded hover:bg-[#1a2226] shadow-sm">
                <UserCheck className="w-4 h-4" /><span>我的认领</span>
              </button>
            </div>
          </div>
          <p className="text-red-600 text-[12px] flex items-center gap-1">
            <span className="w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">i</span>
            请搜索完整的快递单号, 再进行快递认领
          </p>
        </div>
      </div>

      <div className="card flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3 whitespace-nowrap">快遞單號</th>
                <th className="px-4 py-3 whitespace-nowrap">簽收時間</th>
                <th className="px-4 py-3 whitespace-nowrap">認領狀態</th>
                <th className="px-4 py-3 whitespace-nowrap">認領時間</th>
                <th className="px-4 py-3 whitespace-nowrap">倉庫備註</th>
                <th className="px-4 py-3 whitespace-nowrap">包裹閑置時長</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : parcels.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无无主件记录</td></tr>
              ) : parcels.map(p => {
                const days = getIdleDays(p.inbound_at);
                const hours = getIdleHours(p.inbound_at) % 24;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="px-4 py-3 font-mono text-gray-600">{p.tracking_number}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{new Date(p.inbound_at).toLocaleString('zh-CN')}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded border border-gray-200">未認領</span>
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3">
                      <span className="text-red-500 font-medium">{days}天</span>
                      <span className="text-gray-600">/{hours}小时</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
