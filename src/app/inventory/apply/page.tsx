'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FileUp, Search, RefreshCw, ShoppingCart, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateTemplateCsv, downloadCsv, INVENTORY_APPLY_IMPORT_COLUMNS } from '@/lib/csv';
import { CreateInventoryApplyModal } from '@/components/inventory/CreateInventoryApplyModal';
import { CsvImportModal } from '@/components/orders/CsvImportModal';
import { DetailModal } from '@/components/ui/DetailModal';
import { useToast } from '@/components/ui/Toast';

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
  const { toast } = useToast();
  const [rows, setRows] = useState<InventoryApply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detailRow, setDetailRow] = useState<InventoryApply | null>(null);
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

  const toggleSelectAll = () => {
    const allIds = rows.map(r => r.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      toast('请先勾选要操作的记录', 'warning');
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const executeBatchDelete = async () => {
    setConfirmDeleteOpen(false);
    setDeleting(true);
    try {
      const { data: deleted, error } = await supabase
        .from('inventory_apply')
        .delete()
        .in('id', selectedIds)
        .select('id');
      if (error) throw error;
      if (!deleted || deleted.length === 0) {
        throw new Error('删除被拒绝（RLS 策略限制）。');
      }
      toast(`已删除 ${deleted.length} 条记录`, 'success');
      setSelectedIds([]);
      fetchRows();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      toast('批量删除失败：' + msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const allSelected = rows.length > 0 && rows.every(r => selectedIds.includes(r.id));
  const someSelected = rows.some(r => selectedIds.includes(r.id)) && !allSelected;

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
              <button onClick={handleBatchDelete} disabled={deleting} className="flex items-center gap-1.5 h-9 px-4 bg-[#dd4b39] text-white text-sm rounded hover:bg-[#d73925] disabled:opacity-50">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>批量删除{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
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
                <th className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" checked={allSelected} ref={el => { if (el) el.indeterminate = someSelected; }} onChange={toggleSelectAll} /></th>
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
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" checked={selectedIds.includes(r.id)} onChange={() => toggleSelectRow(r.id)} /></td>
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
                  <td className="px-4 py-3 text-center"><button className="text-blue-600 hover:underline text-xs font-bold" onClick={() => setDetailRow(r)}>详情</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs italic">共{rows.length}条记录</span></div>
        </div>
      </div>

      {importOpen && (
        <CsvImportModal
          onClose={() => setImportOpen(false)}
          onImportComplete={() => { fetchRows(); }}
          tableName="inventory_apply"
          importColumns={INVENTORY_APPLY_IMPORT_COLUMNS}
          title="入库申请"
        />
      )}

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-800">确认批量删除</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              确定要删除选中的 <span className="font-bold text-gray-800">{selectedIds.length}</span> 条记录吗？
            </p>
            <p className="text-xs text-red-500 mb-5">此操作不可撤销。</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDeleteOpen(false)} className="px-4 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={executeBatchDelete} className="px-4 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-medium">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {detailRow && (
        <DetailModal
          title="入库申请详情"
          onClose={() => setDetailRow(null)}
          fields={[
            { label: '仓单条码', value: detailRow.barcode },
            { label: '仓库', value: detailRow.warehouse },
            { label: '快递单号', value: detailRow.tracking_number || '-' },
            { label: 'SKU/商品名', value: detailRow.sku || '-' },
            { label: '库位号', value: detailRow.location || '-' },
            { label: '数量', value: detailRow.quantity },
            { label: '下次扣费时间', value: detailRow.next_charge_at ? new Date(detailRow.next_charge_at).toLocaleDateString('zh-CN') : '-' },
            { label: '备注', value: detailRow.remarks || '-' },
            { label: '状态', value: detailRow.status },
            { label: '创建时间', value: new Date(detailRow.created_at).toLocaleString('zh-CN') },
          ]}
        />
      )}
    </div>
  );
}
