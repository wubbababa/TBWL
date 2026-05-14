'use client';

import React from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  Maximize, 
  LayoutGrid, 
  ExternalLink,
  ChevronDown,
  Link
} from 'lucide-react';

export default function UnassociatedParcelsPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Page Header Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">未关联包裹</h1>
        </div>
        
        <div className="p-4 flex flex-wrap gap-2 text-sm text-gray-500">
          这里的包裹尚未与订单关联，请核对信息后进行关联操作。
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        {/* Title and Refresh */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">包裹列表</h2>
          <RefreshCw className="w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>

        {/* Filter Section */}
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
                placeholder="入库批次" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white transition-colors cursor-pointer text-gray-500">
                <option value="">包裹状态</option>
                <option value="pending">待关联</option>
                <option value="checking">核对中</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9] transition-colors min-w-[80px]">
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <span>重置</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px]">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 whitespace-nowrap">物流单号</th>
                <th className="px-4 py-3 whitespace-nowrap">入库时间</th>
                <th className="px-4 py-3 whitespace-nowrap">重量(kg)</th>
                <th className="px-4 py-3 whitespace-nowrap">体积(m³)</th>
                <th className="px-4 py-3 whitespace-nowrap">状态</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 bg-white">
                  没有找到未关联的包裹记录
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
