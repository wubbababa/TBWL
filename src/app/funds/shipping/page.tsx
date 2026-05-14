'use client';

import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, CreditCard, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const [records, setRecords] = useState<ShippingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    let query = supabase.from('shipping_records').select('*');
    if (searchText) query = query.ilike('reference', `%${searchText}%`);
    if (methodFilter) query = query.eq('shipping_method', methodFilter);
    const { data } = await query.order('occurred_at', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800 uppercase">運輸費記錄</h1>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchRecords}
          />
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
              <button onClick={fetchRecords} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3 whitespace-nowrap">流水號</th>
                <th className="px-4 py-3 whitespace-nowrap">訂單號/快遞包裹</th>
                <th className="px-4 py-3 whitespace-nowrap">運輸方式</th>
                <th className="px-4 py-3 whitespace-nowrap">重量(KG)</th>
                <th className="px-4 py-3 whitespace-nowrap">描述</th>
                <th className="px-4 py-3 whitespace-nowrap">積分</th>
                <th className="px-4 py-3 whitespace-nowrap">狀態</th>
                <th className="px-4 py-3 whitespace-nowrap">發生時間</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-16 text-center text-gray-400">暂无运输费记录</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 text-left">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.serial_number}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">{r.reference || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[11px] font-bold">{r.shipping_method || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">{r.weight ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.description || '-'}</td>
                  <td className="px-4 py-3 text-center font-bold text-red-600">{r.points}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.status === '成功' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.occurred_at).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs italic">共{records.length}條記錄</span></div>
        </div>
      </div>
    </div>
  );
}
