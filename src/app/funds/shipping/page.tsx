'use client';

import React, { useState, useCallback } from 'react';
import { Search, RefreshCw, CreditCard, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';

interface ShippingRecord {
  id: string;
  serial_number: string;
  reference: string | null;
  shipping_method: string | null;
  weight: number | null;
  description: string | null;
  points: number;
  status: string;
  occurred_at: string;
}

export default function ShippingDetailsPage() {
  const [searchText, setSearchText] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (searchText) q = q.ilike('reference', `%${searchText}%`);
    if (methodFilter) q = q.eq('shipping_method', methodFilter);
    return q;
  }, [searchText, methodFilter]);

  const { data: records, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<ShippingRecord>({
    table: 'shipping_records',
    orderBy: 'occurred_at',
    filterFn,
  });

  const columns: Column<ShippingRecord>[] = [
    { key: 'serial_number', title: '流水號', className: 'text-center', render: r => <span className="font-mono text-xs text-gray-600">{r.serial_number}</span> },
    { key: 'reference', title: '訂單號/快遞包裹', className: 'text-center', render: r => <span className="text-gray-600 text-xs max-w-[200px] truncate">{r.reference || '-'}</span> },
    { key: 'shipping_method', title: '運輸方式', className: 'text-center', render: r => (
      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[11px] font-bold">{r.shipping_method || '-'}</span>
    )},
    { key: 'weight', title: '重量(KG)', className: 'text-center', render: r => <span>{r.weight ?? '-'}</span> },
    { key: 'description', title: '描述', className: 'text-center', render: r => <span className="text-gray-500 text-xs">{r.description || '-'}</span> },
    { key: 'points', title: '積分', className: 'text-center', render: r => <span className="font-bold text-red-600">{r.points}</span> },
    { key: 'status', title: '狀態', className: 'text-center', render: r => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.status === '成功' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{r.status}</span>
    )},
    { key: 'occurred_at', title: '發生時間', className: 'text-center', render: r => <span className="text-gray-500 text-xs">{new Date(r.occurred_at).toLocaleString('zh-CN')}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800 uppercase">運輸費記錄</h1>
          <RefreshCw className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} onClick={refresh} />
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input type="text" placeholder="訂單編號/快遞單號" value={searchText} onChange={e => setSearchText(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="時間" className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="w-full sm:w-48 relative">
              <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="">運輸方式</option>
                <option value="空运">空运</option>
                <option value="海运">海运</option>
                <option value="陆运">陆运</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={refresh} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <FileSpreadsheet className="w-4 h-4 text-green-700" /><span>导出Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        <DataTable columns={columns} data={records} loading={loading} error={error} emptyText="暂无运输费记录"
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>
    </div>
  );
}
