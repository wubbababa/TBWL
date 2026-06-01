'use client';

import React, { useState, useCallback } from 'react';
import { Search, RefreshCw, ShoppingCart, RotateCcw, AlertCircle } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
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
  const { toast } = useToast();
  const [trackingFilter, setTrackingFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (trackingFilter) q = q.ilike('tracking_number', `%${trackingFilter}%`);
    if (orderFilter) q = q.ilike('order_number', `%${orderFilter}%`);
    return q;
  }, [trackingFilter, orderFilter]);

  const { data: parcels, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<AbnormalParcel>({
    table: 'abnormal_parcels',
    filterFn,
  });

  const columns: Column<AbnormalParcel>[] = [
    { key: 'tracking_number', title: <div className="flex flex-col"><span>快递包裹</span><span>订单编号</span></div>, render: p => (
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-mono text-xs text-gray-600">{p.tracking_number || '-'}</span>
        <span className="text-xs text-blue-600">{p.order_number}</span>
      </div>
    )},
    { key: 'abnormal_type', title: '异常类型', className: 'text-center', render: p => (
      <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[11px] font-bold">{p.abnormal_type}</span>
    )},
    { key: 'process_action', title: '处理', className: 'text-center', render: p => <span className="text-gray-600 text-xs">{p.process_action || '-'}</span> },
    { key: 'created_at', title: '创建时间', className: 'text-center', render: p => <span className="text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('zh-CN')}</span> },
    { key: 'idle_days', title: '包裹闲置时长', className: 'text-center', render: p => <span className="text-red-500 font-medium">{p.idle_days}天</span> },
    { key: 'processed_at', title: '处理时间', className: 'text-center', render: p => <span className="text-gray-500 text-xs">{p.processed_at ? new Date(p.processed_at).toLocaleDateString('zh-CN') : '-'}</span> },
    { key: 'action', title: '操作', className: 'text-center', render: (p) => (
      <button
        onClick={async () => {
          const { error: err } = await supabase
            .from('abnormal_parcels')
            .update({ process_action: '已处理', processed_at: new Date().toISOString() })
            .eq('id', p.id);
          if (err) { toast('处理失败：' + err.message, 'error'); }
          else { toast('包裹已标记为已处理', 'success'); refresh(); }
        }}
        disabled={!!p.processed_at}
        className={`text-xs font-bold ${p.processed_at ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
      >
        {p.processed_at ? '已处理' : '处理'}
      </button>
    )},
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-gray-500 text-[13px] space-y-2 bg-transparent px-1 font-medium italic">
        <p>1.請盡快處理異常的快遞包裹,系統將會自動清空壹個月之前的所有異常記錄數據.</p>
        <p>2.如不及時處理異常信息產生後的后果将由自己承担</p>
        <p>3.超過30天後還未處理的異常快遞包裹，倉庫即做销毁處理，不予任何查找或理赔</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">异常包裹处理中心</h1>
          <RefreshCw className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} onClick={refresh} />
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-start">
            <input type="text" placeholder="快递单号" value={trackingFilter} onChange={e => setTrackingFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && refresh()}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="订单编号" value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && refresh()}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="时间" className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={refresh} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
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

        <div className="mt-4">
          <DataTable columns={columns} data={parcels} loading={loading} error={error} emptyText="暂无异常包裹记录"
            pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
        </div>
      </div>
    </div>
  );
}
