'use client';

import React, { useState, useCallback } from 'react';
import { CreditCard, RefreshCw, Search, FileDown, ChevronDown, Loader2 } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';
import { generateCsv, downloadCsv, SCAN_REGISTER_EXPORT_COLUMNS } from '@/lib/csv';

interface ScanRecord {
  id: string;
  serial_number: string;
  payment_method: string;
  amount: number;
  remarks: string | null;
  status: string;
  created_at: string;
}

export default function ScanRegisterPage() {
  const [methodFilter, setMethodFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('scan_register')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const csv = generateCsv(data ?? [], SCAN_REGISTER_EXPORT_COLUMNS);
      const ts = new Date().toISOString().slice(0, 10);
      downloadCsv(csv, `掃碼轉賬登記記錄_${ts}.csv`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      alert('导出失败：' + msg);
    } finally {
      setExporting(false);
    }
  };

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (methodFilter) q = q.eq('payment_method', methodFilter);
    return q;
  }, [methodFilter]);

  const { data: records, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<ScanRecord>({
    table: 'scan_register',
    filterFn,
  });

  const columns: Column<ScanRecord>[] = [
    { key: 'serial_number', title: '流水號', className: 'text-center', render: r => <span className="font-mono text-xs text-gray-600">{r.serial_number}</span> },
    { key: 'payment_method', title: '支付方式', className: 'text-center', render: r => (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${r.payment_method === '支付宝' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{r.payment_method}</span>
    )},
    { key: 'amount', title: '轉賬金额', className: 'text-center', render: r => <span className="font-bold text-gray-800">¥{Number(r.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span> },
    { key: 'remarks', title: '備註', className: 'text-center', render: r => <span className="text-gray-500 text-xs">{r.remarks || '-'}</span> },
    { key: 'created_at', title: '創建時間', className: 'text-center', render: r => <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleString('zh-CN')}</span> },
    { key: 'status', title: '狀態', className: 'text-center', render: r => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.status === '成功' ? 'bg-green-50 text-green-600 border-green-100' : r.status === '待支付' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{r.status}</span>
    )},
  ];

  return (
    <div className="flex flex-col p-2">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 text-gray-700" />
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>掃碼轉賬登記記錄</span>
          <RefreshCw className={`w-4 h-4 text-blue-500 cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} onClick={refresh} />
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative min-w-[120px]">
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8 cursor-pointer">
            <option value="">請選擇</option>
            <option value="支付宝">支付宝</option>
            <option value="微信支付">微信支付</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <input type="text" placeholder="时间" className="flex-1 max-w-[250px] border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        <button onClick={refresh} className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-sm flex items-center gap-1.5 font-medium shadow-sm">
          <Search className="w-4 h-4" /><span>查詢</span>
        </button>
        <button onClick={handleExport} disabled={exporting} className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-sm flex items-center gap-1.5 font-medium shadow-sm disabled:opacity-50">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}<span>{exporting ? '正在导出…' : '導出Excel'}</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <DataTable columns={columns} data={records} loading={loading} error={error} emptyText="共0條記錄"
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>
    </div>
  );
}
