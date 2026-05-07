'use client';

import React from 'react';
import { 
  Search, 
  RefreshCw
} from 'lucide-react';

export default function TaiwanDatabasePage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Filter Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 bg-white flex flex-wrap gap-3 items-center">
          <div className="w-full sm:w-64">
            <input 
              type="text" 
              placeholder="商品名/SKU" 
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
            />
          </div>
          <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
            <Search className="w-4 h-4" />
            <span>查询</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9] transition-colors border border-[#367fa9]">
            <span>拷贝至臺灣仓库库存商品</span>
          </button>
        </div>
      </div>

      {/* List Table Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        {/* Title and Refresh */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">列表</h2>
          <RefreshCw className="w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px] text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 whitespace-nowrap">店舖</th>
                <th className="px-4 py-3 whitespace-nowrap">缩略图</th>
                <th className="px-4 py-3 whitespace-nowrap">SKU</th>
                <th className="px-4 py-3 whitespace-nowrap">記錄時間</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500 bg-white">
                  没有找到匹配的记录
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
