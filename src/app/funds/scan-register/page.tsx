'use client';

import React from 'react';
import { CreditCard, RefreshCw, Search, FileDown, ChevronDown } from 'lucide-react';

const ScanRegisterSearch = () => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="relative min-w-[120px]">
        <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8">
          <option>請選擇</option>
        </select>
        <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      
      <div className="relative flex-1 max-w-[250px]">
        <input 
          type="text" 
          placeholder="时间" 
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
        />
      </div>

      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-sm flex items-center gap-1.5 font-medium shadow-sm active:scale-95 transition-all">
        <Search className="w-4 h-4" />
        <span>查詢</span>
      </button>

      <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-sm flex items-center gap-1.5 font-medium shadow-sm active:scale-95 transition-all">
        <FileDown className="w-4 h-4" />
        <span>導出Excel</span>
      </button>
    </div>
  );
};

const ScanRegisterTable = () => {
  const columns = ['流水號', '支付方式', '轉賬金额', '備註', '創建時間', '狀態'];

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#f9fafb] text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 border-r border-gray-200 w-10">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-center">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="px-4 py-20 text-center text-gray-400 relative">
                <div className="flex flex-col items-center gap-2">
                   <div className="text-sm opacity-60">共0條記錄</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function ScanRegisterPage() {
  return (
    <div className="flex flex-col p-2">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 text-gray-700" />
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>掃碼轉賬登記記錄</span>
          <RefreshCw className="w-4 h-4 text-blue-500 cursor-pointer" />
        </h1>
      </div>

      {/* Search Section */}
      <ScanRegisterSearch />

      {/* Data Table */}
      <ScanRegisterTable />
    </div>
  );
}
