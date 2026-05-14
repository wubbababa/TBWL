'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, RefreshCw, Search, FileDown, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    let query = supabase.from('scan_register').select('*');
    if (methodFilter) query = query.eq('payment_method', methodFilter);
    const { data } = await query.order('created_at', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  return (
    <div className="flex flex-col p-2">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 text-gray-700" />
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>掃碼轉賬登記記錄</span>
          <RefreshCw
            className={`w-4 h-4 text-blue-500 cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchRecords}
          />
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
        <button onClick={fetchRecords} className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-sm flex items-center gap-1.5 font-medium shadow-sm">
          <Search className="w-4 h-4" /><span>查詢</span>
        </button>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-sm flex items-center gap-1.5 font-medium shadow-sm">
          <FileDown className="w-4 h-4" /><span>導出Excel</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#f9fafb] text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 border-r border-gray-200 w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
                {['流水號', '支付方式', '轉賬金额', '備註', '創建時間', '狀態'].map(col => (
                  <th key={col} className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-center">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-20 text-center text-gray-400"><div className="text-sm opacity-60">共0條記錄</div></td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-100"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 text-center">{r.serial_number}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${r.payment_method === '支付宝' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{r.payment_method}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-800">¥{Number(r.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">{r.remarks || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">{new Date(r.created_at).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.status === '成功' ? 'bg-green-50 text-green-600 border-green-100' : r.status === '待支付' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
