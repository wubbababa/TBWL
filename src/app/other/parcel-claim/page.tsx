'use client';

import React, { useState, useCallback } from 'react';
import { Search, RefreshCw, PackageSearch, UserCheck } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';

interface UnassociatedParcel {
  id: string;
  tracking_number: string;
  status: string;
  inbound_at: string;
}

export default function ParcelClaimPage() {
  const [trackingFilter, setTrackingFilter] = useState('');
  const [showMyClaims, setShowMyClaims] = useState(false);
  const [now] = useState(() => Date.now());

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (trackingFilter) q = q.eq('tracking_number', trackingFilter);
    if (showMyClaims) q = q.eq('status', '已認領');
    return q;
  }, [trackingFilter, showMyClaims]);

  const { data: parcels, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<UnassociatedParcel>({
    table: 'unassociated_parcels',
    orderBy: 'inbound_at',
    filterFn,
  });

  const getIdleDisplay = (inboundAt: string) => {
    const diff = now - new Date(inboundAt).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    return { days, hours };
  };

  const columns: Column<UnassociatedParcel>[] = [
    { key: 'tracking_number', title: '快遞單號', render: p => <span className="font-mono text-gray-600">{p.tracking_number}</span> },
    { key: 'inbound_at', title: '簽收時間', render: p => <span className="text-gray-600 text-xs">{new Date(p.inbound_at).toLocaleString('zh-CN')}</span> },
    { key: 'status', title: '認領狀態', render: () => <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded border border-gray-200">未認領</span> },
    { key: 'claim_time', title: '認領時間', render: () => <span>-</span> },
    { key: 'remark', title: '倉庫備註', render: () => <span>-</span> },
    { key: 'idle', title: '包裹閑置時長', render: p => {
      const { days, hours } = getIdleDisplay(p.inbound_at);
      return <><span className="text-red-500 font-medium">{days}天</span><span className="text-gray-600">/{hours}小时</span></>;
    }},
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[13px] text-gray-500 leading-relaxed px-1">
        <p>1.包裹認領:指寄到倉庫的快遞包裹没有绑定快递也不是入库快递, 倉庫無法識別是誰的包裹, 稱之為&ldquo;無主件&rdquo;</p>
        <p>2.倉庫會將&ldquo;無主件&rdquo;進行公示, 您可以通過输入完整的快遞单号校验, 校驗正確後則可以點擊認領</p>
        <p>3.無主件倉庫會进行公示30天, 30天後無人認領, 倉庫即做銷毀處理, 不予任何查找或理賠</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <PackageSearch className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">包裹認領</h1>
          <RefreshCw className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} onClick={refresh} />
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-3 items-center">
            <input type="text" placeholder="输入您的快遞單號" value={trackingFilter} onChange={e => setTrackingFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && refresh()}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={refresh} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button onClick={() => { setTrackingFilter(''); }} className="h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">返回列表</button>
              <button onClick={() => setShowMyClaims(!showMyClaims)}
                className={`flex items-center gap-1.5 h-9 px-4 text-sm rounded shadow-sm ${showMyClaims ? 'bg-[#3c8dbc] text-white hover:bg-[#367fa9]' : 'bg-[#222d32] text-white hover:bg-[#1a2226]'}`}>
                <UserCheck className="w-4 h-4" /><span>{showMyClaims ? '查看全部' : '我的认领'}</span>
              </button>
            </div>
          </div>
          <p className="text-red-600 text-[12px] flex items-center gap-1">
            <span className="w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">i</span>
            请搜索完整的快递单号, 再进行快递认领
          </p>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={parcels} loading={loading} error={error} emptyText="暂无无主件记录"
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>
    </div>
  );
}
