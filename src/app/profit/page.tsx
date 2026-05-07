'use client';

import React from 'react';
import { 
  Search, 
  RefreshCw, 
  Maximize, 
  LayoutGrid, 
  ExternalLink,
  ChevronDown,
  Calendar,
  Database
} from 'lucide-react';

export default function OrderProfitPage() {
  const stats = [
    { label: '实付金额/CNY', value: '0.00' },
    { label: '订单收入/CNY', value: '0.00' },
    { label: '采购成本/CNY', value: '0.00' },
    { label: '库存成本/CNY', value: '0.00' },
    { label: '货代成本/CNY', value: '0.00' },
    { label: '实际收入/CNY', value: '0.00' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Section Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-800">订单利润</h1>
            <RefreshCw className="w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500" />
            <span className="text-red-500 text-xs font-medium ml-2">默认只统计前三个月的订单数据</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="p-8 grid grid-cols-2 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <span className="text-sm text-gray-700 font-medium mb-3">{stat.label}</span>
              <span className="text-4xl font-bold text-gray-800 tracking-tight">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        {/* Filter Section */}
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
            <div className="lg:col-span-2 text-left">
              <input 
                type="text" 
                placeholder="订单编号" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <div className="relative">
                <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white transition-colors cursor-pointer">
                  <option value="">选择店铺</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="订单创建时间" 
                  className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors cursor-pointer"
                />
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-2 lg:col-span-2">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#00a65a] text-white text-sm rounded hover:bg-[#008d4c] transition-colors border border-[#008d4c]">
                <Database className="w-4 h-4" />
                <span>更新缓存</span>
              </button>
              
              <div className="flex border border-gray-300 rounded overflow-hidden ml-auto lg:ml-0">
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
                <th className="px-4 py-3 whitespace-nowrap">订单编号</th>
                <th className="px-4 py-3 whitespace-nowrap">销售金额(TWD)</th>
                <th className="px-4 py-3 whitespace-nowrap">实付金额(TWD)</th>
                <th className="px-4 py-3 whitespace-nowrap">其它费用(TWD)</th>
                <th className="px-4 py-3 whitespace-nowrap">物流成本(TWD)</th>
                <th className="px-4 py-3 whitespace-nowrap">订单收入(TWD/CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap">采购成本(CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap">库存成本(CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap">货代成本(CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap">实际收入(CNY)</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-gray-500 bg-white">
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
