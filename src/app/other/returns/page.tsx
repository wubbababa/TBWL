'use client';

import React from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  FileText,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

export default function ReturnedParcelsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">退件包裹管理</h1>
        </div>
        
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div>
              <input 
                type="text" 
                placeholder="物流单号" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="原订单号" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white transition-colors cursor-pointer text-gray-500">
                <option value="">退件状态</option>
                <option value="pending">待处理</option>
                <option value="received">已收到</option>
                <option value="reshipped">已重发</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9] transition-colors">
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px]"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3">物流单号</th>
                <th className="px-4 py-3">原订单号</th>
                <th className="px-4 py-3">退件原因</th>
                <th className="px-4 py-3">当前状态</th>
                <th className="px-4 py-3">退回日期</th>
                <th className="px-4 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 bg-white italic">
                  暂无退件包裹记录
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
