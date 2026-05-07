'use client';

import React from 'react';
import { 
  Plus, 
  Trash2, 
  FileUp, 
  Search, 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw
} from 'lucide-react';

export default function TaiwanApplyPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Filter Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 relative">
          {/* Row 1 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">倉單號查詢</label>
            <input 
              type="text" 
              placeholder="倉單號" 
              className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">快遞單號</label>
            <input 
              type="text" 
              placeholder="快遞單號" 
              className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-left">
            <label className="text-sm text-gray-700 min-w-[70px]">貨件編號</label>
            <input 
              type="text" 
              placeholder="貨件編號" 
              className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none"
            />
          </div>

          {/* Row 2 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">商品SKU</label>
            <input 
              type="text" 
              placeholder="商品SKU/商品名" 
              className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">收貨仓库</label>
            <div className="flex-1 relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="Taipei">臺北倉</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">貨件狀態</label>
            <div className="flex-1 relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="">請选择貨件狀態</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Buttons Row */}
          <div className="lg:col-span-3 flex justify-start items-center gap-2 mt-2">
            <div className="flex-1"></div>
            <button className="flex items-center justify-center gap-1.5 h-8 px-3 bg-[#3c8dbc] text-white text-xs rounded hover:bg-[#367fa9] transition-colors">
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 h-8 px-3 bg-white border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
            <div className="flex items-center gap-3 ml-4">
               <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                 <ChevronUp className="w-4 h-4" />
               </button>
               <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                 <RefreshCw className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9] transition-colors">
          <Plus className="w-4 h-4" />
          <span>申请仓儲發貨</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
          <FileUp className="w-4 h-4" />
          <span>EXCEL导入货件</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          <span>模板下载</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f39c12]/20 text-[#dd4b39] border border-[#dd4b39]/30 text-sm rounded hover:bg-[#dd4b39]/10 transition-colors">
          <Trash2 className="w-4 h-4" />
          <span>批量删除</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-[#4b646f] font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px]">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 whitespace-nowrap">會員/代理/貨件編號</th>
                <th className="px-4 py-3 whitespace-nowrap">商品數</th>
                <th className="px-4 py-3 whitespace-nowrap">艙單類型</th>
                <th className="px-4 py-3 whitespace-nowrap">貨件狀態</th>
                <th className="px-4 py-3 whitespace-nowrap">備註</th>
                <th className="px-4 py-3 whitespace-nowrap text-right pr-12">操作</th>
              </tr>
            </thead>
            <tbody>
              {/* Image shows empty state */}
            </tbody>
          </table>
          <div className="p-4 flex items-center gap-2 text-gray-500 text-sm">
            共 0 條記錄
          </div>
        </div>
      </div>
    </div>
  );
}
