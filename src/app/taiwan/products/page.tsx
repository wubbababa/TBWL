'use client';

import React from 'react';
import { 
  Plus, 
  Trash2, 
  FileUp, 
  Search, 
  RefreshCw, 
  Maximize, 
  LayoutGrid, 
  ExternalLink,
  ShoppingCart,
  ChevronDown
} from 'lucide-react';

export default function TaiwanProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Warning Notice */}
      <div className="text-red-600 text-[13px] space-y-1 font-medium bg-transparent px-1">
        <p>如積分不足導致欠费,產品將在7天後销毁库存</p>
        <p>請盡快處理如需退回請 (聯系客服)</p>
      </div>

      {/* Page Header Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">臺灣倉庫商品管理</h1>
        </div>
        
        <div className="p-4 flex flex-wrap gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span>创建臺灣庫存商品</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dd4b39] text-white text-sm rounded hover:bg-[#d73925] transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>批量删除</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f39c12] text-white text-sm rounded hover:bg-[#e08e0b] transition-colors">
            <FileUp className="w-4 h-4" />
            <span>Excel批量导入</span>
          </button>
          <button className="text-[#3c8dbc] text-sm hover:underline ml-1">
            Excel模板下载
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        {/* Title and Refresh */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">臺灣倉庫庫存商品</h2>
          <RefreshCw className="w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>

        {/* Filter Section */}
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div>
              <input 
                type="text" 
                placeholder="商品ID" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="商品编号" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="SKU/商品名" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="闲置时长(天)" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white transition-colors cursor-pointer">
                <option value="Taipei">臺北倉</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors min-w-[80px]">
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <button className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200">
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200">
                  <Maximize className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200">
                  <LayoutGrid className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white hover:bg-gray-50">
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px]">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 whitespace-nowrap">商品ID</th>
                <th className="px-4 py-3 whitespace-nowrap">仓点</th>
                <th className="px-4 py-3 whitespace-nowrap text-[12px]">商品编号/货号/SKU</th>
                <th className="px-4 py-3 whitespace-nowrap">商品名</th>
                <th className="px-4 py-3 whitespace-nowrap">缩略图</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">价格</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">总数</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">剩余数量</th>
                <th className="px-4 py-3 whitespace-nowrap">包裹闲置时长</th>
                <th className="px-4 py-3 whitespace-nowrap">创建时间</th>
                <th className="px-4 py-3 whitespace-nowrap">状态</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-gray-500 bg-white">
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
