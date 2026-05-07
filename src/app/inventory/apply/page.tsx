'use client';

import React from 'react';
import { 
  Plus, 
  Trash2, 
  FileUp, 
  Search, 
  RefreshCw, 
  ShoppingCart,
  ChevronDown
} from 'lucide-react';

export default function InventoryApplyPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Page Header Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">入库存申请</h1>
        </div>
        
        {/* Filter Section */}
        <div className="p-4 bg-white">
          <div className="flex flex-wrap gap-3 items-start">
            <div className="w-full sm:w-40 relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white transition-colors cursor-pointer">
                <option value="">仓点</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="w-full sm:w-56">
              <input 
                type="text" 
                placeholder="仓单条码" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="SKU/商品名/商品编号" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="快递单号" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="w-full sm:w-32 relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white transition-colors cursor-pointer">
                <option value="">所有状态</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" />
                <span>申请入库</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#dd4b39] text-white text-sm rounded hover:bg-[#d73925] transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>批量删除</span>
              </button>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
              <FileUp className="w-4 h-4" />
              <span>Excel批量导入</span>
            </button>
            <button className="text-[#3c8dbc] text-sm hover:underline">
              Excel模板下载
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        {/* Title and Refresh */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">入库存申请列表</h2>
          <RefreshCw className="w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px]">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 whitespace-nowrap">仓单条码</th>
                <th className="px-4 py-3 whitespace-nowrap">仓库</th>
                <th className="px-4 py-3 whitespace-nowrap">快递单号</th>
                <th className="px-4 py-3 whitespace-nowrap">SKU/商品名</th>
                <th className="px-4 py-3 whitespace-nowrap">图片</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">库位号</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">数量</th>
                <th className="px-4 py-3 whitespace-nowrap">下次扣费时间</th>
                <th className="px-4 py-3 whitespace-nowrap">时间</th>
                <th className="px-4 py-3 whitespace-nowrap">备注</th>
                <th className="px-4 py-3 whitespace-nowrap">状态</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-gray-500 bg-white">
                  {/* Empty space matching reference */}
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
