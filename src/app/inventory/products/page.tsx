'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  RefreshCw,
  Maximize,
  LayoutGrid,
  ExternalLink,
  ShoppingCart,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreateInventoryProductModal } from '@/components/inventory/CreateInventoryProductModal';
import { EditInventoryProductModal } from '@/components/inventory/EditInventoryProductModal';
import { InventoryActionToolbar } from '@/components/inventory/InventoryActionToolbar';
import { INVENTORY_PRODUCTS_IMPORT_COLUMNS } from '@/lib/csv';

interface InventoryProduct {
  id: string;
  store_name: string;
  sku: string;
  name: string;
  thumbnail?: string;
  price: number;
  total_count: number;
  remaining_count: number;
  idle_days: number;
  status: string;
  created_at: string;
}

export default function InventoryProductsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState({
    id: '',
    sku: '',
    name: '',
    idleDays: '',
    store: ''
  });

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (searchQuery.sku) q = q.ilike('sku', `%${searchQuery.sku}%`);
    if (searchQuery.name) q = q.ilike('name', `%${searchQuery.name}%`);
    if (searchQuery.store) q = q.eq('store_name', searchQuery.store);
    return q;
  }, [searchQuery.sku, searchQuery.name, searchQuery.store]);

  const { data: products, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<InventoryProduct>({
    table: 'inventory_products',
    filterFn,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refresh();
  };

  const columns: Column<InventoryProduct>[] = [
    { key: 'id', title: '商品ID', render: p => <span className="text-blue-600 font-mono text-xs">{p.id.slice(0, 8)}</span> },
    { key: 'store_name', title: '仓点' },
    { key: 'sku', title: '商品编号/SKU', render: p => <span className="font-medium">{p.sku}</span> },
    { key: 'name', title: '商品名' },
    { key: 'thumbnail', title: '缩略图', render: p => p.thumbnail
      ? <Image src={p.thumbnail} alt={p.name} width={40} height={40} className="w-10 h-10 object-cover rounded border border-gray-200" />
      : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">无图</div>
    },
    { key: 'price', title: '价格', className: 'text-center', render: p => <span className="text-red-600 font-bold">¥{p.price}</span> },
    { key: 'total_count', title: '总数', className: 'text-center' },
    { key: 'remaining_count', title: '剩余', className: 'text-center', render: p => <span className="font-bold text-blue-600">{p.remaining_count}</span> },
    { key: 'idle_days', title: '闲置', render: p => <span>{p.idle_days}天</span> },
    { key: 'created_at', title: '创建时间', render: p => <span className="text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</span> },
    { key: 'status', title: '状态', render: p => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === '在库' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>{p.status}</span>
    )},
    { key: 'action', title: '操作', className: 'text-center', render: (p) => <button className="text-blue-600 hover:underline text-xs font-bold" onClick={() => setEditingProduct(p)}>管理</button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      {showCreateModal && (
        <CreateInventoryProductModal
          onClose={() => setShowCreateModal(false)}
          onCreated={refresh}
        />
      )}
      {editingProduct && (
        <EditInventoryProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={() => { setEditingProduct(null); refresh(); }}
        />
      )}
      {/* Warning Notice */}
      <div className="text-red-600 text-[13px] space-y-1 font-medium bg-transparent px-1">
        <p>如積分不足導致欠费,產品將在7天後销毁库存</p>
        <p>請盡快處理如需退回請 (聯系客服)</p>
      </div>

      {/* Page Header Section */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">库存管理</h1>
        </div>
        
        <div className="p-4 flex flex-wrap gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
            onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            <span>创建商品</span>
          </button>
          <InventoryActionToolbar
            selectedIds={selectedIds}
            tableName="inventory_products"
            importColumns={INVENTORY_PRODUCTS_IMPORT_COLUMNS}
            templateFileName="库存商品导入模板.csv"
            title="库存商品"
            onActionComplete={() => { setSelectedIds([]); refresh(); }}
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card flex flex-col min-h-[400px]">
        {/* Title and Refresh */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">库存商品</h2>
            <RefreshCw 
              className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} 
              onClick={refresh}
            />
          </div>
          {error && (
            <div className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-100">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <form onSubmit={handleSearch} className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div>
              <input 
                type="text" 
                placeholder="商品ID" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
                value={searchQuery.id}
                onChange={(e) => setSearchQuery({...searchQuery, id: e.target.value})}
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="商品编号" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
                value={searchQuery.sku}
                onChange={(e) => setSearchQuery({...searchQuery, sku: e.target.value})}
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="SKU/商品名" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
                value={searchQuery.name}
                onChange={(e) => setSearchQuery({...searchQuery, name: e.target.value})}
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="闲置时长(天)" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
                value={searchQuery.idleDays}
                onChange={(e) => setSearchQuery({...searchQuery, idleDays: e.target.value})}
              />
            </div>
            <div className="relative">
              <select 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white transition-colors cursor-pointer"
                value={searchQuery.store}
                onChange={(e) => setSearchQuery({...searchQuery, store: e.target.value})}
              >
                <option value="">仓点</option>
                <option value="深圳仓">深圳仓</option>
                <option value="台湾仓">台湾仓</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9] transition-colors min-w-[80px]"
              >
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <button type="button" onClick={refresh} className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200">
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
                <button type="button" className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200">
                  <Maximize className="w-4 h-4 text-gray-600" />
                </button>
                <button type="button" className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200">
                  <LayoutGrid className="w-4 h-4 text-gray-600" />
                </button>
                <button type="button" className="p-2 bg-white hover:bg-gray-50">
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Table Section */}
        <DataTable columns={columns} data={products} loading={loading} error={error} emptyText="没有找到匹配的记录"
          selectedIds={selectedIds} onSelectionChange={setSelectedIds}
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>
    </div>
  );
}
