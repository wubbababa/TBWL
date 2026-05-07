'use client';

import React from 'react';
import { 
  Search, 
  RefreshCw, 
  ShoppingCart,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function AbnormalParcelsPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Policy/Notice Section */}
      <div className="text-gray-500 text-[13px] space-y-2 bg-transparent px-1 font-medium italic">
        <p>1.請盡快處理異常的快遞包裹,系統將會自動清空壹個月之前的所有異常記錄數據.</p>
        <p>2.如不及時處理異常信息產生後的后果将由自己承担</p>
        <p>3.超過30天後還未處理的異常快遞包裹，倉庫即做销毁處理，不予任何查找或理赔</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">异常包裹处理中心</h1>
          <RefreshCw className="w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>
        
        {/* Filter Section */}
        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-start">
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="快递单号" 
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
                placeholder="时间" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors min-w-[80px]">
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <RotateCcw className="w-4 h-4" />
                <span>返回列表</span>
              </button>
            </div>
          </div>
          
          {/* Warning text below inputs */}
          <div className="mt-2 flex items-center gap-1 text-red-600 text-[12px] font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>請搜索完整的快遞單號，或者訂單編號</span>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px] text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3">
                  <div className="flex flex-col">
                    <span>快递包裹</span>
                    <span>订单编号</span>
                  </div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap">异常类型</th>
                <th className="px-4 py-3 whitespace-nowrap">处理</th>
                <th className="px-4 py-3 whitespace-nowrap">创建时间</th>
                <th className="px-4 py-3 whitespace-nowrap">包裹闲置时长</th>
                <th className="px-4 py-3 whitespace-nowrap">处理时间</th>
                <th className="px-4 py-3 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {/* No records message footer-style or full row */}
              <tr className="border-b border-gray-100 italic">
                <td colSpan={8} className="px-4 py-10 bg-white">
                  {/* The image shows "共0条记录" on the right, but usually empty states are centered or have a row.
                      In the image, it looks like a footer text or a very sparse row. */}
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
