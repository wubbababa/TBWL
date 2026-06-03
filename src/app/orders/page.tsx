'use client';

import React, { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { OrderTabs } from '@/components/orders/OrderTabs';
import { FilterForm } from '@/components/orders/FilterForm';
import { ActionToolbar } from '@/components/orders/ActionButtons';
import { OrderTable } from '@/components/orders/OrderTable';
import { OrderDetailModal } from '@/components/orders/OrderDetailModal';
import type { Order } from '@/components/orders/OrderTable';

/** All filter dimensions lifted to the page level so tabs, form, and table share the same state. */
export interface OrderFilters {
  tab: string;
  searchText: string;
  orderId: string;
  recipient: string;
  orderBy: string;
  shippingMethod: string;
  store: string;
  orderType: string;
  status: string;
  fetchTime: string;
  submitTime: string;
  transferTime: string;
  storeEntryTime: string;
}

const EMPTY_FILTERS: OrderFilters = {
  tab: '待处理',
  searchText: '',
  orderId: '',
  recipient: '',
  orderBy: '',
  shippingMethod: '',
  store: '',
  orderType: '',
  status: '',
  fetchTime: '',
  submitTime: '',
  transferTime: '',
  storeEntryTime: '',
};

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>(EMPTY_FILTERS);
  const [queryTrigger, setQueryTrigger] = useState(0); // bumped → OrderTable re-fetches
  const [loading] = useState(false);

  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Checkbox selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /** Merge partial filter updates. */
  const updateFilters = useCallback((patch: Partial<OrderFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  /** Tab click: update tab and immediately trigger search. */
  const handleTabChange = useCallback(
    (tab: string) => {
      updateFilters({ tab });
      setQueryTrigger((n) => n + 1);
    },
    [updateFilters],
  );

  /** "查询" button / "清空" button triggers a search. */
  const handleSearch = useCallback(() => {
    setQueryTrigger((n) => n + 1);
  }, []);

  const handleClear = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setQueryTrigger((n) => n + 1);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  /** Called after any batch action or modal update — clear selection and re-fetch. */
  const handleActionComplete = useCallback(() => {
    setSelectedIds([]);
    setQueryTrigger((n) => n + 1);
  }, []);

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
      </div>

      {/* Tabs Filter */}
      <OrderTabs activeTab={filters.tab} onTabChange={handleTabChange} />

      {/* Main Filter Form */}
      <FilterForm
        filters={filters}
        onFilterChange={updateFilters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {/* Actions Toolbar */}
      <ActionToolbar
        selectedIds={selectedIds}
        onActionComplete={handleActionComplete}
      />

      {/* Data Table */}
      <OrderTable
        filters={filters}
        queryTrigger={queryTrigger}
        onOrderClick={setSelectedOrder}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={() => {
            setSelectedOrder(null);
            handleActionComplete();
          }}
          onDeleted={() => {
            setSelectedOrder(null);
            handleActionComplete();
          }}
        />
      )}
    </div>
  );
}
