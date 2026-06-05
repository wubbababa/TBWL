'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Trash2, FileUp, FileText, Search, RefreshCw, ShoppingCart, ChevronDown } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';
import { EditInventoryProductModal } from '@/components/inventory/EditInventoryProductModal';
import { CsvImportModal } from '@/components/orders/CsvImportModal';
import { generateTemplateCsv, downloadCsv, INVENTORY_PRODUCTS_IMPORT_COLUMNS } from '@/lib/csv';

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

export default function TaiwanProductsPage() {
  const [searchQuery, setSearchQuery] = useState({ sku: '', name: '', store: '台北仓' });
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [importOpen, setImportOpen] = useState(false);

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
    { key: 'action', title: '操作', className: 'text-center', render: (p) => <button onClick={() => setEditingProduct(p)} className="text-blue-600 hover:underline text-xs font-bold">管理</button> },
  ];

  return (
    <div className="flex flex-col gap-4">
      {editingProduct && (
        <EditInventoryProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={() => { setEditingProduct(null); refresh(); }}
        />
      )}
      <div className="text-red-600 text-[13px] space-y-1 font-medium px-1">
        <p>如積分不足導致欠费,產品將在7天後销毁库存</p>
        <p>請盡快處理如需退回請 (聯系客服)</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">臺灣倉庫商品管理</h1>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
            <Plus className="w-4 h-4" /><span>创建臺灣庫存商品</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dd4b39] text-white text-sm rounded hover:bg-[#d73925]">
            <Trash2 className="w-4 h-4" /><span>批量删除</span>
          </button>
          <button onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f39c12] text-white text-sm rounded hover:bg-[#e08e0b]">
            <FileUp className="w-4 h-4" /><span>Excel批量导入</span>
          </button>
          <button onClick={() => { const csv = generateTemplateCsv(INVENTORY_PRODUCTS_IMPORT_COLUMNS); downloadCsv(csv, '臺灣倉庫商品导入模板.csv'); }} className="text-[#3c8dbc] text-sm hover:underline ml-1">Excel模板下载</button>
        </div>
      </div>

      <div className="card flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">臺灣倉庫庫存商品</h2>
          <RefreshCw className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} onClick={refresh} />
        </div>

        <form onSubmit={e => { e.preventDefault(); refresh(); }} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <input type="text" placeholder="商品编号" value={searchQuery.sku} onChange={e => setSearchQuery({...searchQuery, sku: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && refresh()}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="SKU/商品名" value={searchQuery.name} onChange={e => setSearchQuery({...searchQuery, name: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && refresh()}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="relative">
              <select value={searchQuery.store} onChange={e => setSearchQuery({...searchQuery, store: e.target.value})}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="台北仓">臺北倉</option>
                <option value="台中仓">臺中倉</option>
                <option value="高雄仓">高雄倉</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button type="submit" className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9]">
              <Search className="w-4 h-4" /><span>查询</span>
            </button>
          </div>
        </form>

        <DataTable columns={columns} data={products} loading={loading} error={error} emptyText="没有找到匹配的记录"
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>

      {importOpen && (
        <CsvImportModal
          onClose={() => setImportOpen(false)}
          onImportComplete={() => { setImportOpen(false); refresh(); }}
          tableName="inventory_products"
          importColumns={INVENTORY_PRODUCTS_IMPORT_COLUMNS}
          title="臺灣倉庫商品"
        />
      )}
    </div>
  );
}
