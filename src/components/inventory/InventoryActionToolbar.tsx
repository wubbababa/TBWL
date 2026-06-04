'use client';

import React, { useState } from 'react';
import { Trash2, FileUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateTemplateCsv, downloadCsv, type CsvColumn } from '@/lib/csv';
import { CsvImportModal } from '@/components/orders/CsvImportModal';
import { useToast } from '@/components/ui/Toast';

interface Props {
  selectedIds: string[];
  tableName: string;
  importColumns: CsvColumn[];
  templateFileName: string;
  title?: string;
  onActionComplete: () => void;
}

export const InventoryActionToolbar = ({
  selectedIds,
  tableName,
  importColumns,
  templateFileName,
  title,
  onActionComplete,
}: Props) => {
  const { toast } = useToast();
  const [importOpen, setImportOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasSelection = selectedIds.length > 0;

  const requireSelection = (): boolean => {
    if (selectedIds.length === 0) {
      toast('请先勾选要操作的记录', 'warning');
      return false;
    }
    return true;
  };

  const handleBatchDelete = () => {
    if (!requireSelection()) return;
    setConfirmDeleteOpen(true);
  };

  const executeBatchDelete = async () => {
    setConfirmDeleteOpen(false);
    setDeleting(true);
    try {
      const { data: deleted, error } = await supabase
        .from(tableName)
        .delete()
        .in('id', selectedIds)
        .select('id');

      if (error) throw error;

      if (!deleted || deleted.length === 0) {
        throw new Error('删除被拒绝（RLS 策略限制）。请确认数据库权限配置。');
      }

      toast(`已删除 ${deleted.length} 条记录`, 'success');
      onActionComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      toast('批量删除失败：' + msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleTemplateDownload = () => {
    const csv = generateTemplateCsv(importColumns);
    downloadCsv(csv, templateFileName);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleBatchDelete}
          disabled={deleting || !hasSelection}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dd4b39] text-white text-sm rounded hover:bg-[#d73925] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={hasSelection ? `删除选中的 ${selectedIds.length} 条` : '请先选择记录'}
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          <span>批量删除{hasSelection ? ` (${selectedIds.length})` : ''}</span>
        </button>
        <button
          onClick={() => setImportOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f39c12] text-white text-sm rounded hover:bg-[#e08e0b] transition-colors"
        >
          <FileUp className="w-4 h-4" />
          <span>Excel批量导入</span>
        </button>
        <button onClick={handleTemplateDownload} className="text-[#3c8dbc] text-sm hover:underline ml-1">
          Excel模板下载
        </button>
      </div>

      {importOpen && (
        <CsvImportModal
          onClose={() => setImportOpen(false)}
          onImportComplete={onActionComplete}
          tableName={tableName}
          importColumns={importColumns}
          title={title}
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
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-4 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeBatchDelete}
                className="px-4 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
