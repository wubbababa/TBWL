'use client';

import React from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';

export const FilterForm = () => {
  return (
    <div className="bg-white p-4 border border-gray-200 rounded shadow-sm mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {/* Row 1 */}
        <input
          type="text"
          placeholder="订单号/追踪号/头程码/快递单号"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="订单ID"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="收件人姓名/电话"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="下单人"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="relative">
          <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>寄件方式</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Row 2 */}
        <div className="relative">
          <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>选择店铺</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>订单类型</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>订单状态</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <input
          type="text"
          placeholder="获取时间"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="提交时间"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        
        {/* Row 3 Partial */}
        <input
          type="text"
          placeholder="转运时间"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="入店时间"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 lg:col-span-2 xl:col-span-3"
        />

        {/* Action Buttons in Form */}
        <div className="flex gap-2 lg:col-span-1">
          <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-1.5 rounded text-sm flex items-center gap-1">
            <Search className="w-4 h-4" />
            <span>查询</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button className="text-gray-600 text-sm hover:underline">清空</button>
        <button className="text-gray-800 text-sm font-bold flex items-center gap-1">
          <Search className="w-3 h-3" />
          <span>高级筛选</span>
        </button>
      </div>
    </div>
  );
};
