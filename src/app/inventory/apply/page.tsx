'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FileUp, Search, RefreshCw, ShoppingCart, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateTemplateCsv, downloadCsv, INVENTORY_APPLY_IMPORT_COLUMNS } from '@/lib/csv';
import { CreateInventoryApplyModal } from '@/components/inventory/CreateInventoryApplyModal';

interface InventoryApply {
  id: string;
  barcode: string;
  warehouse: string;
  tracking_number: string | null;
  sku: string | null;
  location: string | null;
  quantity: number;
  next_charge_at: string | null;
  remarks: string | null;
  status: string;
  created_at: string;
}

const statusStyle = (s: string) => {
  if (s === '已入库') return 'bg-green-50 text-green-600 border-green-100';
  if (s === '待入库') return 'bg-yellow-50 text-yellow-600 border-yellow-100';
  if (s === '审核中') return 'bg-blue-50 text-blue-600 border-blue-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

export default function InventoryApplyPage() {
  const [rows, setRows] = useState<InventoryApply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [barcodeFilter, setBarcodeFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [trackingFilter, setTrackingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRows = async () => {
    setLoading(true);
    let query = supabase.from('inventory_apply').select('*');
    if (warehouseFilter) query = query.eq('warehouse', warehouseFilter);
    if (barcodeFilter) query = query.ilike('barcode', `%${barcodeFilter}%`);
    if (skuFilter) query = query.ilike('sku', `%${skuFilter}%`);
    if (trackingFilter) query = query.ilike('tracking_number', `%${trackingFilter}%`);
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data } = await query.order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRows(); }, []);

  return (
    <div className="flex flex-col gap-4">
      {showCreateModal && (
        <CreateInventoryApplyModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchRows}
        />
      )}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">入库存申请</h1>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-start">
            <div className="w-full sm:w-40 relative">
              <select value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="">仓点</option>
                <option value="深圳仓">深圳仓</option>
                <option value="台北仓">台北仓</option>
                <option value="台中仓">台中仓</option>
                <option value="高雄仓">高雄仓</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <input type="text" placeholder="仓单条码" value={barcodeFilter} onChange={e => setBarcodeFilter(e.target.value)}
              className="w-full sm:w-56 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="SKU/商品名/商品编号" value={skuFilter} onChange={e => setSkuFilter(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <input type="text" placeholder="快递单号" value={trackingFilter} onChange={e => setTrackingFilter(e.target.value)}
              className="w-full sm:w-64 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            <div className="w-full sm:w-32 relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="">所有状态</option>
                <option value="待入库">待入库</option>
                <option value="审核中">审核中</option>
                <option value="已入库">已入库</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={fetchRows} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <Search className="w-4 h-4" /><span>查询</span>
              </button>
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50">
                <Plus className="w-4 h-4" /><span>申请入库</span>
              </button>
              <button className="flex items-center gap-1.5 h-9 px-4 bg-[#dd4b39] text-white text-sm rounded hover:bg-[#d73925]">
                <Trash2 className="w-4 h-4" /><span>批量删除</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
              <FileUp className="w-4 h-4" /><span>Excel批量导入</span>
            </button>
            <button
              onClick={() => {
                const csv = generateTemplateCsv(INVENTORY_APPLY_IMPORT_COLUMNS);
                downloadCsv(csv, '入库申请导入模板.csv');
              }}
              className="text-[#3c8dbc] text-sm hover:underline"
            >
              Excel模板下载
            </button>
          </div>
        </div>
      </div>

      <div className="card flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">入库存申请列表</h2>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchRows}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3 whitespace-nowrap">仓单条码</th>
                <th className="px-4 py-3 whitespace-nowrap">仓库</th>
                <th className="px-4 py-3 whitespace-nowrap">快递单号</th>
                <th className="px-4 py-3 whitespace-nowrap">SKU/商品名</th>
                <th className="px-4 py-3 whitespace-nowrap">图片</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">库位号</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">数量</th>
                <th className="px-4 py-3 whitespace-nowrap">下次扣费时间</th>
                <th className="px-4 py-3 whitespace-nowrap">时间</th>
                <th className="px-4 py-3 whitespace-nowrap">备注</th>
                <th className="px-4 py-3 whitespace-nowrap">状态</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={13} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={13} className="px-4 py-8 text-center text-gray-400"></td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.barcode}</td>
                  <td className="px-4 py-3">{r.warehouse}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.tracking_number || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{r.sku || '-'}</td>
                  <td className="px-4 py-3"><div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">无图</div></td>
                  <td className="px-4 py-3 text-center">{r.location || '-'}</td>
                  <td className="px-4 py-3 text-center font-bold">{r.quantity}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.next_charge_at ? new Date(r.next_charge_at).toLocaleDateString('zh-CN') : '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.remarks || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center"><button className="text-blue-600 hover:underline text-xs font-bold">详情</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs italic">共{rows.length}条记录</span></div>
        </div>
      </div>
    </div>
  );
}
