'use client';

import React, { useState } from 'react';
import {
  Plus, FileOutput, FileUp, Download, RefreshCw,
  Trash2, CheckCircle, Package, FileText, ChevronDown, Loader2,
  AlertTriangle, XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateCsv, downloadCsv, generateTemplateCsv, EXPORT_COLUMNS, IMPORT_COLUMNS } from '@/lib/csv';
import { CsvImportModal } from './CsvImportModal';

// lucide-react v1 may not export CloudSync — use a fallback
let CloudSync: React.ComponentType<{ className?: string }>;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  CloudSync = require('lucide-react').CloudSync ?? (() => null);
} catch {
  CloudSync = () => null;
}

interface Props {
  /** IDs of currently selected orders. */
  selectedIds: string[];
  /** Called after a batch action completes so the parent can refresh. */
  onActionComplete: () => void;
}

export const ActionToolbar = ({ selectedIds, onActionComplete }: Props) => {
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [batchLoading, setBatchLoading] = useState<string | null>(null); // which action is running

  /* ---- Export ---- */
  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_number, shipping_method, product_list, remarks, status, tracking_info, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csv = generateCsv(data ?? [], EXPORT_COLUMNS);
      const ts = new Date().toISOString().slice(0, 10);
      downloadCsv(csv, `订单导出_${ts}.csv`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      alert('导出失败：' + msg);
    } finally {
      setExporting(false);
    }
  };

  /* ---- Template ---- */
  const handleTemplateDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    const csv = generateTemplateCsv(IMPORT_COLUMNS);
    downloadCsv(csv, '订单导入模板.csv');
  };

  /* ---- Import complete ---- */
  const handleImportComplete = () => {
    onActionComplete();
  };

  /* ---- Guard: require selection ---- */
  const requireSelection = (): boolean => {
    if (selectedIds.length === 0) {
      alert('请先勾选要操作的订单');
      return false;
    }
    return true;
  };

  /* ---- Batch delete ---- */
  const handleBatchDelete = async () => {
    if (!requireSelection()) return;
    const confirmed = window.confirm(
      `确定要删除选中的 ${selectedIds.length} 条订单吗？此操作不可撤销。`,
    );
    if (!confirmed) return;

    setBatchLoading('delete');
    try {
      const { data: deleted, error } = await supabase
        .from('orders')
        .delete()
        .in('id', selectedIds)
        .select('id');

      if (error) throw error;

      if (!deleted || deleted.length === 0) {
        throw new Error(
          '删除被拒绝（RLS 策略限制）。请在 Supabase 控制台执行 supabase/fix_orders_rls.sql 修复权限。',
        );
      }

      onActionComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      alert('批量删除失败：' + msg);
    } finally {
      setBatchLoading(null);
    }
  };

  /* ---- Batch status update helper ---- */
  const batchUpdateStatus = async (status: string, actionKey: string) => {
    if (!requireSelection()) return;
    setBatchLoading(actionKey);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', selectedIds);
      if (error) throw error;
      onActionComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      alert(`操作失败：${msg}`);
    } finally {
      setBatchLoading(null);
    }
  };

  const handleSubmitPacking = () => batchUpdateStatus('已提交/待打包', 'packing');
  const handleSetAbnormal = () => batchUpdateStatus('异常件', 'abnormal');
  const handleCloseOrders = () => batchUpdateStatus('已关闭', 'close');

  const hasSelection = selectedIds.length > 0;

  return (
    <>
    <div className="flex flex-col gap-4 mb-4">
      {/* Primary Actions (White with border) */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4 text-black" />
          <span>手工添加订单</span>
        </button>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95">
          <CloudSync className="w-4 h-4 text-black" />
          <span>同步缺失订单</span>
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 text-black animate-spin" />
          ) : (
            <FileOutput className="w-4 h-4 text-black" />
          )}
          <span>{exporting ? '正在导出…' : '导出订单'}</span>
        </button>
        <button
          onClick={() => setImportOpen(true)}
          className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95"
        >
          <FileUp className="w-4 h-4 text-black" />
          <span>Excel批量导入订单</span>
        </button>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95">
          <FileUp className="w-4 h-4 text-black" />
          <span>批量上传面单</span>
        </button>

        <a
          href="#"
          onClick={handleTemplateDownload}
          className="text-blue-600 text-sm hover:underline ml-2"
        >
          Excel 导入订单模板下载
        </a>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-bold text-gray-700">上次同步:</span>
          <button className="bg-[#f4f4f4] border border-gray-300 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium shadow-sm transition-all active:scale-95">
            手动同步订单
          </button>
        </div>
      </div>

      {/* Batch Operations (Colored) */}
      <div className="flex flex-wrap items-center gap-2 bg-transparent">
        {/* 批量删除 */}
        <button
          onClick={handleBatchDelete}
          disabled={batchLoading === 'delete' || !hasSelection}
          className="bg-[#f39c12] hover:bg-[#e08e0b] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 shadow-sm transition-all active:scale-95 font-medium"
          title={hasSelection ? `删除选中的 ${selectedIds.length} 条` : '请先选择订单'}
        >
          {batchLoading === 'delete' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>批量删除{hasSelection ? ` (${selectedIds.length})` : ''}</span>
        </button>

        <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 shadow-sm transition-all active:scale-95 font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>批量快速/库存</span>
        </button>

        {/* 提交打包 */}
        <button
          onClick={handleSubmitPacking}
          disabled={batchLoading === 'packing' || !hasSelection}
          className="bg-[#00c0ef] hover:bg-[#00add7] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 shadow-sm transition-all active:scale-95 font-medium"
          title={hasSelection ? `提交打包选中的 ${selectedIds.length} 条` : '请先选择订单'}
        >
          {batchLoading === 'packing' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Package className="w-4 h-4" />
          )}
          <span>提交打包{hasSelection ? ` (${selectedIds.length})` : ''}</span>
        </button>

        {/* Disabled / Secondary Actions */}
        <div className="flex flex-wrap items-center gap-1">
          <button className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1.5 rounded text-sm cursor-not-allowed">货物描述</button>
          <button className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1.5 rounded text-sm cursor-not-allowed">头程标签</button>
          <button className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1.5 rounded text-sm cursor-not-allowed">上传面单</button>
          <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1 shadow-sm transition-all active:scale-95">
            <FileText className="w-4 h-4" />
            <span>获取面单</span>
          </button>

          {/* 设置异常 */}
          <button
            onClick={handleSetAbnormal}
            disabled={batchLoading === 'abnormal' || !hasSelection}
            className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm flex items-center gap-1 shadow-sm transition-all active:scale-95"
            title={hasSelection ? `设置异常 ${selectedIds.length} 条` : '请先选择订单'}
          >
            {batchLoading === 'abnormal' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>设置异常{hasSelection ? ` (${selectedIds.length})` : ''}</span>
          </button>

          {/* 关闭作废 */}
          <button
            onClick={handleCloseOrders}
            disabled={batchLoading === 'close' || !hasSelection}
            className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm flex items-center gap-1 shadow-sm transition-all active:scale-95"
            title={hasSelection ? `关闭作废 ${selectedIds.length} 条` : '请先选择订单'}
          >
            {batchLoading === 'close' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>关闭作废{hasSelection ? ` (${selectedIds.length})` : ''}</span>
          </button>
        </div>

        {/* View Controls on Right */}
        <div className="ml-auto flex items-center gap-2 border border-gray-200 rounded p-1 bg-white">
           <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><RefreshCw className="w-4 h-4 text-gray-600" /></button>
           <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Download className="w-4 h-4 text-gray-600 rotate-180" /></button>
           <button className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center gap-1 px-2 border-l border-gray-100">
             <div className="grid grid-cols-2 gap-0.5">
               <div className="w-1.5 h-1.5 bg-gray-400"></div>
               <div className="w-1.5 h-1.5 bg-gray-400"></div>
               <div className="w-1.5 h-1.5 bg-gray-400"></div>
               <div className="w-1.5 h-1.5 bg-gray-400"></div>
             </div>
             <ChevronDown className="w-3 h-3 text-gray-400" />
           </button>
        </div>
      </div>
    </div>

    {importOpen && (
      <CsvImportModal
        onClose={() => setImportOpen(false)}
        onImportComplete={handleImportComplete}
      />
    )}
    </>
  );
};
