'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { parseCsv, type CsvColumn } from '@/lib/csv';
import { useToast } from '@/components/ui/Toast';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PreviewRow {
  /** 0-based row index from the CSV (for display). */
  index: number;
  /** Raw key-value pairs keyed by Chinese header label. */
  data: Record<string, string>;
}

type ImportPhase = 'select' | 'preview' | 'importing' | 'done';

interface ImportResult {
  success: number;
  errors: { row: number; message: string }[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  onClose: () => void;
  /** Called after a successful import so the parent can refresh data. */
  onImportComplete: () => void;
  /** Target Supabase table name. */
  tableName: string;
  /** Column definitions for validation and import mapping. */
  importColumns: CsvColumn[];
  /** Modal title override. */
  title?: string;
}

export const CsvImportModal = ({ onClose, onImportComplete, tableName, importColumns, title }: Props) => {
  /* state */
  const { toast } = useToast();
  const [phase, setPhase] = useState<ImportPhase>('select');
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape (only in select/done phase)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase !== 'importing') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, phase]);

  /* ---- file handling ---- */

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast('请选择 .csv 格式的文件', 'warning');
      return;
    }

    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCsv(text);

    if (parsed.length === 0) {
      toast('CSV 文件为空或格式不正确，请检查后重试。', 'error');
      return;
    }

    // Validate that the CSV has at least the order_number column
    const headers = Object.keys(parsed[0]);
    const labelSet = new Set(importColumns.map((c) => c.label));
    const recognised = headers.filter((h) => labelSet.has(h));

    if (recognised.length === 0) {
      toast(
        `CSV 列名无法识别。请确保第一行是列标题，且包含：${importColumns.slice(0, 3).map((c) => c.label).join('、')} 等`,
        'error',
      );
      return;
    }

    setRows(parsed.map((data, i) => ({ index: i + 2, data })));
    setPhase('preview');
  }, [toast, importColumns]);

  const onFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so the same file can be selected again
      e.target.value = '';
    },
    [handleFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  /* ---- import ---- */

  const startImport = useCallback(async () => {
    setPhase('importing');
    setImportProgress(0);

    const labelToKey = new Map(importColumns.map((c) => [c.label, c.key]));

    const successes: ImportResult = { success: 0, errors: [] };

    // Process rows sequentially so each error can be captured by row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Map Chinese headers → DB column keys
      const record: Record<string, string> = {};
      for (const [label, value] of Object.entries(row.data)) {
        const key = labelToKey.get(label);
        if (key) record[key] = value;
      }

      const { error } = await supabase.from(tableName).insert([record]);

      if (error) {
        successes.errors.push({ row: row.index, message: error.message });
      } else {
        successes.success++;
      }

      setImportProgress(i + 1);
    }

    setResult(successes);
    setPhase('done');
  }, [rows, importColumns, tableName]);

  /* ---- render helpers ---- */

  const previewHeaders = rows.length > 0 ? Object.keys(rows[0].data) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="csv-import-title">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 id="csv-import-title" className="text-lg font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            CSV 导入{title || '数据'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-auto p-5">
          {phase === 'select' && (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 font-medium">
                点击选择 CSV 文件，或拖拽文件到此处
              </p>
              <p className="text-xs text-gray-400 mt-1">
                支持 UTF-8 编码的 .csv 文件
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={onFileSelected}
              />
            </div>
          )}

          {phase === 'preview' && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                已解析 <strong>{rows.length}</strong> 行数据，来自
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {fileName}
                </span>
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto border border-gray-200 rounded max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 border-r border-gray-200 text-gray-500 text-xs w-10">
                        #
                      </th>
                      {previewHeaders.map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 border-r border-gray-200 text-xs font-semibold text-gray-700 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 100).map((row) => (
                      <tr
                        key={row.index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-3 py-1.5 border-r border-gray-200 text-xs text-gray-400">
                          {row.index}
                        </td>
                        {previewHeaders.map((h) => (
                          <td
                            key={h}
                            className="px-3 py-1.5 border-r border-gray-200 text-xs max-w-[200px] truncate"
                          >
                            {row.data[h] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length > 100 && (
                      <tr>
                        <td
                          colSpan={previewHeaders.length + 1}
                          className="px-3 py-2 text-center text-xs text-gray-400 italic"
                        >
                          ... 还有 {rows.length - 100} 行未显示
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {phase === 'importing' && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-gray-600">正在导入数据，请稍候…</p>
              <p className="text-xs text-gray-400">
                已处理 {importProgress} / {rows.length} 行
              </p>
              {rows.length > 0 && (
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(importProgress / rows.length) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {phase === 'done' && result && (
            <div>
              {result.errors.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <p className="text-lg font-bold text-green-700">
                    导入成功
                  </p>
                  <p className="text-gray-600">
                    共导入 <strong>{result.success}</strong> 条{title || '数据'}记录
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">
                      成功导入 {result.success} 条
                    </span>
                    <AlertTriangle className="w-5 h-5 text-amber-500 ml-3" />
                    <span className="text-amber-700 font-medium">
                      {result.errors.length} 条失败
                    </span>
                  </div>

                  <div className="border border-red-200 rounded overflow-hidden">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-3 py-2 border-r border-red-100 text-xs">
                            行号
                          </th>
                          <th className="px-3 py-2 text-xs">错误信息</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((e, i) => (
                          <tr
                            key={i}
                            className="border-b border-red-50 hover:bg-red-50/50"
                          >
                            <td className="px-3 py-1.5 border-r border-red-50 text-xs text-gray-500">
                              {e.row}
                            </td>
                            <td className="px-3 py-1.5 text-xs text-red-600">
                              {e.message}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          {phase === 'preview' && (
            <>
              <button
                onClick={() => {
                  setPhase('select');
                  setRows([]);
                  setFileName('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
              >
                重新选择
              </button>
              <button
                onClick={startImport}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
              >
                确认导入 ({rows.length} 条)
              </button>
            </>
          )}
          {(phase === 'select' || phase === 'importing') && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              取消
            </button>
          )}
          {phase === 'done' && (
            <button
              onClick={() => {
                onImportComplete();
                onClose();
              }}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
