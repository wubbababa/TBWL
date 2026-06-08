'use client';

import React, { useState, useCallback } from 'react';
import { RotateCcw, Search, RefreshCw, ChevronDown, X } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';
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
  const [trackingFilter, setTrackingFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processingRow, setProcessingRow] = useState<ReturnParcel | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (trackingFilter) q = q.ilike('tracking_number', `%${trackingFilter}%`);
    if (orderFilter) q = q.ilike('original_order', `%${orderFilter}%`);
    if (statusFilter) q = q.eq('status', statusFilter);
    return q;
  }, [trackingFilter, orderFilter, statusFilter]);

  const { data: returns, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<ReturnParcel>({
    table: 'returns',
    orderBy: 'returned_at',
    filterFn,
  });

  const handleSaveStatus = async () => {
    if (!processingRow || !newStatus) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('returns').update({ status: newStatus }).eq('id', processingRow.id);
      if (error) throw error;
      setProcessingRow(null);
      refresh();
    } catch (err) {
      console.error('更新失败:', err);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<ReturnParcel>[] = [
    { key: 'tracking_number', title: '物流单号', render: r => <span className="font-mono text-gray-700">{r.tracking_number}</span> },
    { key: 'original_order', title: '原订单号', render: r => <span className="text-blue-600">{r.original_order || '-'}</span> },
    { key: 'reason', title: '退件原因', render: r => <span className="text-gray-600">{r.reason}</span> },
    { key: 'status', title: '当前状态', render: r => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle(r.status)}`}>{r.status}</span>
    )},
    { key: 'returned_at', title: '退回日期', render: r => <span className="text-gray-500 text-xs">{new Date(r.returned_at).toLocaleDateString('zh-CN')}</span> },
    { key: 'action', title: '操作', className: 'text-center', render: (r) => <button className="text-blue-600 hover:underline text-xs font-bold" onClick={() => { setProcessingRow(r); setNewStatus(r.status); }}>处理</button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">退件包裹管理</h1>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={refresh}
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
            <button onClick={refresh} className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9]">
              <Search className="w-4 h-4" /><span>查询</span>
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={returns} loading={loading} error={error} emptyText="暂无退件包裹记录"
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>

      {processingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setProcessingRow(null)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-800">处理退件</h3>
              <button onClick={() => setProcessingRow(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="text-sm text-gray-600">物流单号: <span className="font-mono font-bold text-gray-800">{processingRow.tracking_number}</span></div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">更新状态</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white">
                  <option value="待处理">待处理</option>
                  <option value="已收到">已收到</option>
                  <option value="已重发">已重发</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setProcessingRow(null)} className="px-4 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSaveStatus} disabled={saving}
                className="px-4 py-1.5 rounded bg-[#3c8dbc] text-white text-sm font-medium hover:bg-[#367fa9] disabled:opacity-50">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
