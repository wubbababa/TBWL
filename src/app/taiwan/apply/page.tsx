'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FileUp, Search, RefreshCw, ChevronDown, ChevronUp, Download, RotateCcw, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateTemplateCsv, downloadCsv, TAIWAN_APPLY_IMPORT_COLUMNS } from '@/lib/csv';
import { CreateTaiwanApplyModal } from '@/components/taiwan/CreateTaiwanApplyModal';
import { CsvImportModal } from '@/components/orders/CsvImportModal';
import { useToast } from '@/components/ui/Toast';

interface TaiwanApply {
  id: string;
  member_code: string;
  product_count: number;
  manifest_type: string;
  status: string;
  remarks: string | null;
  created_at: string;
}

const statusStyle = (s: string) => {
  if (s === '已发货') return 'bg-green-50 text-green-600 border-green-100';
  if (s === '处理中') return 'bg-blue-50 text-blue-600 border-blue-100';
  if (s === '待处理') return 'bg-yellow-50 text-yellow-600 border-yellow-100';
  if (s === '已取消') return 'bg-gray-50 text-gray-400 border-gray-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

export default function TaiwanApplyPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<TaiwanApply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [memberFilter, setMemberFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRows = async () => {
    setLoading(true);
    let query = supabase.from('taiwan_apply').select('*');
    if (memberFilter) query = query.ilike('member_code', `%${memberFilter}%`);
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
        .from('taiwan_apply')
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
        <CreateTaiwanApplyModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchRows}
        />
      )}
      <div className="card">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">倉單號查詢</label>
            <input type="text" placeholder="倉單號" value={memberFilter} onChange={e => setMemberFilter(e.target.value)}
              className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">快遞單號</label>
            <input type="text" placeholder="快遞單號" className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">貨件編號</label>
            <input type="text" placeholder="貨件編號" className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">商品SKU</label>
            <input type="text" placeholder="商品SKU/商品名" className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">收貨仓库</label>
            <div className="flex-1 relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="Taipei">臺北倉</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">貨件狀態</label>
            <div className="flex-1 relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="">請选择貨件狀態</option>
                <option value="待处理">待处理</option>
                <option value="处理中">处理中</option>
                <option value="已发货">已发货</option>
                <option value="已取消">已取消</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="lg:col-span-3 flex justify-start items-center gap-2 mt-2">
            <div className="flex-1"></div>
            <button onClick={fetchRows} className="flex items-center gap-1.5 h-8 px-3 bg-[#3c8dbc] text-white text-xs rounded hover:bg-[#367fa9]">
              <Search className="w-3.5 h-3.5" /><span>查询</span>
            </button>
            <button onClick={() => { setMemberFilter(''); setStatusFilter(''); }} className="flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50">
              <RotateCcw className="w-3.5 h-3.5" /><span>重置</span>
            </button>
            <div className="flex items-center gap-3 ml-4">
              <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><ChevronUp className="w-4 h-4" /></button>
              <RefreshCw
                className={`w-4 h-4 text-gray-500 cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
                onClick={fetchRows}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9]">
          <Plus className="w-4 h-4" /><span>申请仓儲發貨</span>
        </button>
        <button onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
          <FileUp className="w-4 h-4" /><span>EXCEL导入货件</span>
        </button>
        <button
          onClick={() => {
            const csv = generateTemplateCsv(TAIWAN_APPLY_IMPORT_COLUMNS);
            downloadCsv(csv, '台湾申请入库模板.csv');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
        >
          <Download className="w-4 h-4" /><span>模板下载</span>
        </button>
        <button onClick={handleBatchDelete} disabled={deleting} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f39c12]/20 text-[#dd4b39] border border-[#dd4b39]/30 text-sm rounded hover:bg-[#dd4b39]/10 disabled:opacity-50">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          <span>批量删除{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
        </button>
      </div>

      <div className="card flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-[#4b646f] font-bold">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" checked={allSelected} ref={el => { if (el) el.indeterminate = someSelected; }} onChange={toggleSelectAll} /></th>
                <th className="px-4 py-3 whitespace-nowrap">會員/代理/貨件編號</th>
                <th className="px-4 py-3 whitespace-nowrap">商品數</th>
                <th className="px-4 py-3 whitespace-nowrap">艙單類型</th>
                <th className="px-4 py-3 whitespace-nowrap">貨件狀態</th>
                <th className="px-4 py-3 whitespace-nowrap">備註</th>
                <th className="px-4 py-3 whitespace-nowrap">創建時間</th>
                <th className="px-4 py-3 whitespace-nowrap text-right pr-12">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">暂无发货申请记录</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" checked={selectedIds.includes(r.id)} onChange={() => toggleSelectRow(r.id)} /></td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{r.member_code}</td>
                  <td className="px-4 py-3 text-center font-bold">{r.product_count}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-full text-[11px] font-bold">{r.manifest_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.remarks || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3 text-right pr-12"><button className="text-blue-600 hover:underline text-xs font-bold">详情</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex items-center gap-2 text-gray-500 text-sm">共 {rows.length} 條記錄</div>
        </div>
      </div>

      {importOpen && (
        <CsvImportModal
          onClose={() => setImportOpen(false)}
          onImportComplete={() => { fetchRows(); }}
          tableName="taiwan_apply"
          importColumns={TAIWAN_APPLY_IMPORT_COLUMNS}
          title="台湾入库申请"
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
    </div>
  );
}
