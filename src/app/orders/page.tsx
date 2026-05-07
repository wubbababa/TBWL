'use client';

import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Settings, AlertCircle } from 'lucide-react';
import { OrderTabs } from '@/components/orders/OrderTabs';
import { FilterForm } from '@/components/orders/FilterForm';
import { ActionToolbar } from '@/components/orders/ActionButtons';
import { OrderTable } from '@/components/orders/OrderTable';

export default function OrdersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = () => {
    // 触发页面刷新以重新加载组件数据
    window.location.reload(); 
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title Section */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-gray-400" />
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>订单包裹</span>
            <RefreshCw 
              className={`w-4 h-4 text-blue-500 cursor-pointer ${loading ? 'animate-spin' : ''}`} 
              onClick={handleRefresh}
            />
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-1 text-red-500 text-xs bg-red-50 px-2 py-1 rounded border border-red-100">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          )}
          <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer" />
          <Settings className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
      </div>

      {/* Tabs Filter */}
      <OrderTabs />

      {/* Main Filter Form */}
      <FilterForm />

      {/* Actions Toolbar */}
      <ActionToolbar />

      {/* Data Table */}
      <OrderTable />
    </div>
  );
}
