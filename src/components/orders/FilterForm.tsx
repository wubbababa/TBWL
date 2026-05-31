'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { OrderFilters } from '@/app/orders/page';

interface Props {
  filters: OrderFilters;
  onFilterChange: (patch: Partial<OrderFilters>) => void;
  onSearch: () => void;
  onClear: () => void;
}

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

const inputCls = 'border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500';
const selectCls = `w-full ${inputCls} appearance-none bg-white`;

export const FilterForm = ({ filters, onFilterChange, onSearch, onClear }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const key = FIELD_MAP[e.target.name];
    if (key) onFilterChange({ [key]: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  const hasAdvancedFilters = filters.recipient || filters.orderBy || filters.store ||
    filters.orderType || filters.status || filters.fetchTime ||
    filters.submitTime || filters.transferTime || filters.storeEntryTime;

  return (
    <div className="card p-4 mb-4">
      {/* Primary filters - always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <input name="searchText" value={filters.searchText} onChange={handleChange} onKeyDown={handleKeyDown}
          placeholder="订单号/追踪号/头程码/快递单号" className={inputCls} />
        <input name="orderId" value={filters.orderId} onChange={handleChange} onKeyDown={handleKeyDown}
          placeholder="订单ID" className={inputCls} />
        <div className="relative">
          <select name="shippingMethod" value={filters.shippingMethod} onChange={handleChange} className={selectCls}>
            <option value="">寄件方式</option>
            <option value="空运">空运</option>
            <option value="海运">海运</option>
            <option value="陆运">陆运</option>
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onSearch}
            className="bg-[#3c8dbc] hover:bg-[#337ab7] text-white px-4 py-1.5 rounded text-sm flex items-center gap-1 transition-colors">
            <Search className="w-4 h-4" /><span>查询</span>
          </button>
          <button type="button" onClick={() => setExpanded(!expanded)}
            className="text-gray-600 text-sm flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>高级</span>
            {hasAdvancedFilters && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
          </button>
        </div>
      </div>

      {/* Advanced filters - collapsible */}
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-3 pt-3 border-t border-gray-100">
          <input name="recipient" value={filters.recipient} onChange={handleChange} onKeyDown={handleKeyDown}
            placeholder="收件人姓名/电话" className={inputCls} />
          <input name="orderBy" value={filters.orderBy} onChange={handleChange} onKeyDown={handleKeyDown}
            placeholder="下单人" className={inputCls} />
          <div className="relative">
            <select name="store" value={filters.store} onChange={handleChange} className={selectCls}>
              <option value="">选择店铺</option>
              <option value="深圳仓">深圳仓</option>
              <option value="台北仓">台北仓</option>
              <option value="台中仓">台中仓</option>
              <option value="高雄仓">高雄仓</option>
            </select>
            <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select name="orderType" value={filters.orderType} onChange={handleChange} className={selectCls}>
              <option value="">订单类型</option>
              <option value="普通订单">普通订单</option>
              <option value="预售订单">预售订单</option>
              <option value="补发订单">补发订单</option>
              <option value="退货订单">退货订单</option>
            </select>
            <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select name="status" value={filters.status} onChange={handleChange} className={selectCls}>
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
          <label className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm focus-within:ring-1 focus-within:ring-blue-500">
            <span className="text-gray-400 text-xs mr-2 shrink-0">获取</span>
            <input type="date" name="fetchTime" value={filters.fetchTime} onChange={handleChange} className="flex-1 min-w-0 bg-transparent focus:outline-none text-sm" />
          </label>
          <label className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm focus-within:ring-1 focus-within:ring-blue-500">
            <span className="text-gray-400 text-xs mr-2 shrink-0">提交</span>
            <input type="date" name="submitTime" value={filters.submitTime} onChange={handleChange} className="flex-1 min-w-0 bg-transparent focus:outline-none text-sm" />
          </label>
          <label className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm focus-within:ring-1 focus-within:ring-blue-500">
            <span className="text-gray-400 text-xs mr-2 shrink-0">转运</span>
            <input type="date" name="transferTime" value={filters.transferTime} onChange={handleChange} className="flex-1 min-w-0 bg-transparent focus:outline-none text-sm" />
          </label>
          <label className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm focus-within:ring-1 focus-within:ring-blue-500">
            <span className="text-gray-400 text-xs mr-2 shrink-0">入店</span>
            <input type="date" name="storeEntryTime" value={filters.storeEntryTime} onChange={handleChange} className="flex-1 min-w-0 bg-transparent focus:outline-none text-sm" />
          </label>
          <button type="button" onClick={onClear} className="text-gray-600 text-sm hover:text-red-500 transition-colors self-center">
            清空筛选
          </button>
        </div>
      )}
    </div>
  );
};
