'use client';

import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import type { OrderFilters } from '@/app/orders/page';

interface Props {
  filters: OrderFilters;
  onFilterChange: (patch: Partial<OrderFilters>) => void;
  onSearch: () => void;
  onClear: () => void;
}

/** Map filter keys to input change events. */
const FIELD_MAP: Record<string, keyof OrderFilters> = {
  searchText: 'searchText',
  orderId: 'orderId',
  recipient: 'recipient',
  orderBy: 'orderBy',
  shippingMethod: 'shippingMethod',
  store: 'store',
  orderType: 'orderType',
  status: 'status',
  fetchTime: 'fetchTime',
  submitTime: 'submitTime',
  transferTime: 'transferTime',
  storeEntryTime: 'storeEntryTime',
};

export const FilterForm = ({ filters, onFilterChange, onSearch, onClear }: Props) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const key = FIELD_MAP[e.target.name];
    if (key) {
      onFilterChange({ [key]: e.target.value });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white p-4 border border-gray-200 rounded shadow-sm mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {/* Row 1 */}
        <input
          name="searchText"
          value={filters.searchText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="订单号/追踪号/头程码/快递单号"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          name="orderId"
          value={filters.orderId}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="订单ID"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          name="recipient"
          value={filters.recipient}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="收件人姓名/电话"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          name="orderBy"
          value={filters.orderBy}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="下单人"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="relative">
          <select
            name="shippingMethod"
            value={filters.shippingMethod}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">寄件方式</option>
            <option value="空运">空运</option>
            <option value="海运">海运</option>
            <option value="陆运">陆运</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Row 2 */}
        <div className="relative">
          <select
            name="store"
            value={filters.store}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">选择店铺</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            name="orderType"
            value={filters.orderType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">订单类型</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">订单状态</option>
            <option value="待处理">待处理</option>
            <option value="已提交/待打包">已提交/待打包</option>
            <option value="转运中">转运中</option>
            <option value="预刷件">预刷件</option>
            <option value="取消中">取消中</option>
            <option value="异常件">异常件</option>
            <option value="待确认入店">待确认入店</option>
            <option value="已送店">已送店</option>
            <option value="退件重发">退件重发</option>
            <option value="已关闭">已关闭</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <input
          name="fetchTime"
          value={filters.fetchTime}
          onChange={handleChange}
          placeholder="获取时间"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          name="submitTime"
          value={filters.submitTime}
          onChange={handleChange}
          placeholder="提交时间"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        {/* Row 3 Partial */}
        <input
          name="transferTime"
          value={filters.transferTime}
          onChange={handleChange}
          placeholder="转运时间"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          name="storeEntryTime"
          value={filters.storeEntryTime}
          onChange={handleChange}
          placeholder="入店时间"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 lg:col-span-2 xl:col-span-3"
        />

        {/* Action Buttons in Form */}
        <div className="flex gap-2 lg:col-span-1">
          <button
            type="button"
            onClick={onSearch}
            className="bg-[#3c8dbc] hover:bg-[#337ab7] text-white px-4 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>查询</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          type="button"
          onClick={onClear}
          className="text-gray-600 text-sm hover:underline"
        >
          清空
        </button>
        <button
          type="button"
          className="text-gray-800 text-sm font-bold flex items-center gap-1"
        >
          <Search className="w-3 h-3" />
          <span>高级筛选</span>
        </button>
      </div>
    </div>
  );
};
