'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  store_name: string;
  sku: string;
  name: string;
  thumbnail: string | null;
  created_at: string;
}

export default function TaiwanDatabasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    // 台湾商品数据库：仅显示台湾各仓的商品
    let query = supabase
      .from('inventory_products')
      .select('id, store_name, sku, name, thumbnail, created_at')
      .in('store_name', ['台北仓', '台中仓', '高雄仓']);
    if (searchText) query = query.or(`name.ilike.%${searchText}%,sku.ilike.%${searchText}%`);
    const { data } = await query.order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProducts(); }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="w-full sm:w-64">
            <input type="text" placeholder="商品名/SKU" value={searchText} onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchProducts()}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <button onClick={fetchProducts} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
            <Search className="w-4 h-4" /><span>查询</span>
          </button>
          <button className="flex items-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9] border border-[#367fa9]">
            <span>拷贝至臺灣仓库库存商品</span>
          </button>
        </div>
      </div>

      <div className="card flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">列表</h2>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchProducts}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3 whitespace-nowrap">店舖</th>
                <th className="px-4 py-3 whitespace-nowrap">缩略图</th>
                <th className="px-4 py-3 whitespace-nowrap">SKU</th>
                <th className="px-4 py-3 whitespace-nowrap">商品名</th>
                <th className="px-4 py-3 whitespace-nowrap">記錄時間</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">没有找到匹配的记录</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 text-left">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-center text-gray-600">{p.store_name}</td>
                  <td className="px-4 py-3 text-center">
                    {p.thumbnail
                      ? <Image src={p.thumbnail} alt={p.name} width={40} height={40} className="w-10 h-10 object-cover rounded border border-gray-200 mx-auto" />
                      : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 mx-auto">无图</div>}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs text-center">{new Date(p.created_at).toLocaleDateString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs">共{products.length}条记录</span></div>
        </div>
      </div>
    </div>
  );
}
