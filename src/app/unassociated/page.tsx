'use client';

import React, { useState, useCallback } from 'react';
import { Package, Search, RefreshCw, ChevronDown } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';

interface UnassociatedParcel {
  id: string;
  tracking_number: string;
  weight: number | null;
  volume: number | null;
  status: string;
  inbound_at: string;
}

export default function UnassociatedParcelsPage() {
  const [trackingFilter, setTrackingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (trackingFilter) q = q.ilike('tracking_number', `%${trackingFilter}%`);
    if (statusFilter) q = q.eq('status', statusFilter);
    return q;
  }, [trackingFilter, statusFilter]);

  const { data: parcels, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<UnassociatedParcel>({
    table: 'unassociated_parcels',
    orderBy: 'inbound_at',
    filterFn,
  });

  const columns: Column<UnassociatedParcel>[] = [
    { key: 'tracking_number', title: '物流单号', render: p => <span className="font-mono text-gray-700">{p.tracking_number}</span> },
    { key: 'inbound_at', title: '入库时间', render: p => <span className="text-gray-500 text-xs">{new Date(p.inbound_at).toLocaleString('zh-CN')}</span> },
    { key: 'weight', title: '重量(kg)', render: p => <span>{p.weight ?? '-'}</span> },
    { key: 'volume', title: '体积(m³)', render: p => <span>{p.volume ?? '-'}</span> },
    { key: 'status', title: '状态', render: p => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.status === '待关联' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : p.status === '核对中' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
        {p.status}
      </span>
    )},
    { key: 'action', title: '操作', className: 'text-center', render: () => <button className="text-blue-600 hover:underline text-xs font-bold">关联</button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">未关联包裹</h1>
        </div>
        <div className="p-4 flex flex-wrap gap-2 text-sm text-gray-500">
          这里的包裹尚未与订单关联，请核对信息后进行关联操作。
        </div>
      </div>

      <div className="card flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">包裹列表</h2>
          <RefreshCw className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} onClick={refresh} />
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <input type="text" placeholder="物流单号" value={trackingFilter} onChange={e => setTrackingFilter(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="入库批次" className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer text-gray-500">
                <option value="">包裹状态</option>
                <option value="待关联">待关联</option>
                <option value="核对中">核对中</option>
                <option value="已关联">已关联</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={refresh} className="flex items-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9]">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button onClick={() => { setTrackingFilter(''); setStatusFilter(''); }} className="h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">重置</button>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={parcels} loading={loading} error={error} emptyText="没有找到未关联的包裹记录"
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>
    </div>
  );
}
