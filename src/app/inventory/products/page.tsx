'use client';

import React, { useEffect, useState } from 'react';
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
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CreateInventoryProductModal } from '@/components/inventory/CreateInventoryProductModal';

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
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    id: '',
    sku: '',
    name: '',
    idleDays: '',
    store: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('inventory_products').select('*');

      if (searchQuery.sku) {
        query = query.ilike('sku', `%${searchQuery.sku}%`);
      }
      if (searchQuery.name) {
        query = query.ilike('name', `%${searchQuery.name}%`);
      }
      if (searchQuery.store) {
        query = query.eq('store_name', searchQuery.store);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Fetch inventory error:', err);
      setError(err.message || '获取库存数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="flex flex-col gap-4">
      {showCreateModal && (
        <CreateInventoryProductModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchProducts}
        />
      )}
      {/* Warning Notice */}
      <div className="text-red-600 text-[13px] space-y-1 font-medium bg-transparent px-1">
        <p>如積分不足導致欠费,產品將在7天後销毁库存</p>
        <p>請盡快處理如需退回請 (聯系客服)</p>
      </div>

      {/* Page Header Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
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
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col min-h-[400px]">
        {/* Title and Refresh */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">库存商品</h2>
            <RefreshCw 
              className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} 
              onClick={fetchProducts}
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
                <button type="button" onClick={fetchProducts} className="p-2 bg-white hover:bg-gray-50 border-r border-gray-200">
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px]">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 whitespace-nowrap">商品ID</th>
                <th className="px-4 py-3 whitespace-nowrap">仓点</th>
                <th className="px-4 py-3 whitespace-nowrap">商品编号/货号/SKU</th>
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
              {loading ? (
                <tr>
                  <td colSpan={13} className="px-4 py-20 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <span className="text-gray-400">正在加载库存数据...</span>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="px-4 py-3 text-blue-600 font-mono text-xs">{p.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{p.store_name}</td>
                    <td className="px-4 py-3 font-medium">{p.sku}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.name} className="w-10 h-10 object-cover rounded border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">无图</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-red-600 font-bold">¥{p.price}</td>
                    <td className="px-4 py-3 text-center">{p.total_count}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600">{p.remaining_count}</td>
                    <td className="px-4 py-3">{p.idle_days}天</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === '在库' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-blue-600 hover:underline text-xs font-bold">管理</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-4 py-20 text-center text-gray-500 bg-white">
                    没有找到匹配的记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
