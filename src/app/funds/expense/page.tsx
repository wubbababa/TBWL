'use client';

import React from 'react';
import { 
  Search, 
  RefreshCw, 
  CreditCard,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';

export default function ExpenseDetailsPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Page Header Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800 uppercase">消費記錄</h1>
          <RefreshCw className="w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>
        
        {/* Filter Section */}
        <div className="p-4 bg-white">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="訂單編號/快遞單號" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="w-full sm:w-32 relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white transition-colors cursor-pointer">
                <option value="">--</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="時間" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <FileSpreadsheet className="w-4 h-4 text-green-700" />
                <span>导出Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px] text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 whitespace-nowrap">流水號</th>
                <th className="px-4 py-3 whitespace-nowrap">消費類型</th>
                <th className="px-4 py-3 whitespace-nowrap">訂單編號/快遞單號/店鋪名</th>
                <th className="px-4 py-3 whitespace-nowrap">描述</th>
                <th className="px-4 py-3 whitespace-nowrap">積分</th>
                <th className="px-4 py-3 whitespace-nowrap">狀態</th>
                <th className="px-4 py-3 whitespace-nowrap">發生時間</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-gray-500 bg-white">
                  {/* Empty state matches reference image */}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="p-4 flex justify-end">
            <span className="text-gray-400 text-xs italic">共0條記錄</span>
          </div>
        </div>
      </div>
    </div>
  );
}
