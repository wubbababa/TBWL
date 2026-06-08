'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Search, RefreshCw, Copy } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { DataTable, Column } from '@/components/ui/DataTable';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  store_name: string;
  sku: string;
  name: string;
  thumbnail: string | null;
  created_at: string;
}

export default function ProductDatabasePage() {
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    if (selectedIds.length === 0) return;
    setCopying(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory_products')
        .select('*')
        .in('id', selectedIds);
      if (fetchError) throw fetchError;
      if (!data?.length) return;
      const newRecords = data.map(({ id, created_at, ...rest }) => rest);
      const { error: insertError } = await supabase.from('inventory_products').insert(newRecords);
      if (insertError) throw insertError;
      setSelectedIds([]);
      refresh();
    } catch (err) {
      console.error('拷贝失败:', err);
    } finally {
      setCopying(false);
    }
  };

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    if (searchText) return query.or(`name.ilike.%${searchText}%,sku.ilike.%${searchText}%`);
    return query;
  }, [searchText]);

  const { data: products, loading, error, total, page, totalPages, setPage, refresh } = useTableQuery<Product>({
    table: 'inventory_products',
    filterFn,
  });

  const columns: Column<Product>[] = [
    { key: 'store_name', title: '店铺', className: 'text-center' },
    { key: 'thumbnail', title: '缩略图', className: 'text-center', render: p => p.thumbnail
      ? <Image src={p.thumbnail} alt={p.name} width={40} height={40} className="w-10 h-10 object-cover rounded border border-gray-200 mx-auto" />
      : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 mx-auto">无图</div>
    },
    { key: 'sku', title: 'SKU', render: p => <span className="font-medium text-gray-700">{p.sku}</span> },
    { key: 'name', title: '商品名' },
    { key: 'created_at', title: '记录时间', className: 'text-center', render: p => <span className="text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('zh-CN')}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <div className="w-full sm:w-64">
            <input type="text" placeholder="商品名/SKU" value={searchText} onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && refresh()}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <button onClick={refresh} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
            <Search className="w-4 h-4" /><span>查询</span>
          </button>
          <button onClick={handleCopy} disabled={selectedIds.length === 0 || copying}
            className="flex items-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9] border border-[#367fa9] disabled:opacity-50 disabled:cursor-not-allowed">
            <Copy className="w-4 h-4" />
            <span>{copying ? '拷贝中...' : selectedIds.length > 0 ? `拷贝至库存商品(${selectedIds.length})` : '拷贝至库存商品'}</span>
          </button>
        </div>
      </div>

      <div className="card flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">列表</h2>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={refresh}
          />
        </div>
        <DataTable columns={columns} data={products} loading={loading} error={error} emptyText="没有找到匹配的记录"
          checkbox selectedIds={selectedIds} onSelectionChange={setSelectedIds}
          pagination={{ page, totalPages, total, pageSize: 20, setPage }} />
      </div>
    </div>
  );
}
