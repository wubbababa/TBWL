'use client';

import React from 'react';
import { 
  Search, 
  RefreshCw, 
  ShoppingCart,
  ChevronLeft
} from 'lucide-react';

export default function InventoryRecordsPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Page Header Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">库存调用记录</h1>
        </div>
        
        {/* Filter Section */}
        <div className="p-4 bg-white">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="商品ID" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="订单编号" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="SKU/商品名" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors min-w-[80px]">
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                <span>返回</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        {/* Title and Refresh */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">调用记录</h2>
          <RefreshCw className="w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">商品ID</th>
                <th className="px-4 py-3 whitespace-nowrap">订单编号</th>
                <th className="px-4 py-3 whitespace-nowrap">SKU/商品名</th>
                <th className="px-4 py-3 whitespace-nowrap">调用数量</th>
                <th className="px-4 py-3 whitespace-nowrap">描述</th>
                <th className="px-4 py-3 whitespace-nowrap">创建时间</th>
                <th className="px-4 py-3 whitespace-nowrap">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 bg-white">
                  {/* Empty state matching reference */}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="p-4 flex justify-end">
            <span className="text-gray-400 text-xs italic">共0条记录</span>
          </div>
        </div>
      </div>
    </div>
  );
}
