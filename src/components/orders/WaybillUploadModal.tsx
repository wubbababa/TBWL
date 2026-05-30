'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  X, Upload, FileText, CheckCircle, AlertTriangle, Loader2, Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  uploadWaybill,
  validateWaybillFile,
  getExtension,
  ALLOWED_WAYBILL_EXTENSIONS,
  type OrderWaybillFields,
} from '@/lib/waybill';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Phase = 'select' | 'matching' | 'preview' | 'uploading' | 'done';

interface MatchedRow {
  file: File;
  /** 由文件名解析出的订单编号（去扩展名）。 */
  orderNumber: string;
  /** 匹配到的订单（未匹配则为 null）。 */
  order: OrderWaybillFields | null;
  /** 文件校验错误（类型/大小），无错误为 null。 */
  fileError: string | null;
  /** 上传结果状态。 */
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

interface Props {
  onClose: () => void;
  /** 上传完成后通知父组件刷新数据。 */
  onUploadComplete: () => void;
  /**
   * 可选：仅在这些订单 ID 范围内匹配（对应"勾选后上传面单"）。
   * 不传则在全部订单中按编号匹配。
   */
  restrictToIds?: string[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const WaybillUploadModal = ({ onClose, onUploadComplete, restrictToIds }: Props) => {
  const [phase, setPhase] = useState<Phase>('select');
  const [rows, setRows] = useState<MatchedRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- 根据文件名匹配订单 ---- */
  const matchFiles = useCallback(
    async (files: File[]) => {
      setPhase('matching');

      // 解析每个文件的订单编号（文件名去扩展名）
      const orderNumbers = Array.from(
        new Set(files.map((f) => f.name.slice(0, f.name.length - getExtension(f.name).length).trim())),
      ).filter(Boolean);

      // 查询匹配的订单
      let orderMap = new Map<string, OrderWaybillFields>();
      if (orderNumbers.length > 0) {
        let query = supabase
          .from('orders')
          .select('id, order_number, waybill_path, waybill_filename, waybill_uploaded_at')
          .in('order_number', orderNumbers);

        if (restrictToIds && restrictToIds.length > 0) {
          query = query.in('id', restrictToIds);
        }

        const { data, error } = await query;
        if (error) {
          alert('匹配订单失败：' + error.message);
          setPhase('select');
          return;
        }
        orderMap = new Map((data ?? []).map((o) => [o.order_number, o as OrderWaybillFields]));
      }

      const matched: MatchedRow[] = files.map((file) => {
        const orderNumber = file.name
          .slice(0, file.name.length - getExtension(file.name).length)
          .trim();
        return {
          file,
          orderNumber,
          order: orderMap.get(orderNumber) ?? null,
          fileError: validateWaybillFile(file),
          status: 'pending',
        };
      });

      setRows(matched);
      setPhase('preview');
    },
    [restrictToIds],
  );

  /* ---- 文件选择/拖拽 ---- */
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      matchFiles(Array.from(fileList));
    },
    [matchFiles],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeRow = useCallback((idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  /* ---- 上传 ---- */
  const uploadableRows = useMemo(
    () => rows.filter((r) => r.order && !r.fileError),
    [rows],
  );

  const startUpload = useCallback(async () => {
    setPhase('uploading');
    setProgress(0);

    const next = [...rows];
    let done = 0;

    for (let i = 0; i < next.length; i++) {
      const row = next[i];
      if (!row.order || row.fileError) {
        continue;
      }
      next[i] = { ...row, status: 'uploading' };
      setRows([...next]);

      try {
        await uploadWaybill(row.order, row.file);
        next[i] = { ...next[i], status: 'success', message: '上传成功' };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '上传失败';
        next[i] = { ...next[i], status: 'error', message: msg };
      }
      done++;
      setProgress(Math.round((done / uploadableRows.length) * 100));
      setRows([...next]);
    }

    setPhase('done');
  }, [rows, uploadableRows.length]);

  /* ---- 统计 ---- */
  const matchedCount = uploadableRows.length;
  const unmatchedCount = rows.filter((r) => !r.order).length;
  const invalidCount = rows.filter((r) => r.fileError).length;
  const successCount = rows.filter((r) => r.status === 'success').length;
  const failCount = rows.filter((r) => r.status === 'error').length;

  /* ---- 渲染 ---- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3c8dbc]" />
            批量上传面单
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-auto p-5">
          {phase === 'select' && (
            <>
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-[#3c8dbc] bg-blue-50' : 'border-gray-300 hover:border-[#3c8dbc] hover:bg-gray-50'
                }`}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium">点击选择面单文件，或拖拽多个文件到此处</p>
                <p className="text-xs text-gray-400 mt-1">
                  支持 {ALLOWED_WAYBILL_EXTENSIONS.join('、')}，单文件不超过 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_WAYBILL_EXTENSIONS.join(',')}
                  className="hidden"
                  onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
                />
              </div>
              <div className="mt-4 text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded p-3 leading-relaxed">
                <p className="font-medium text-amber-700 mb-1">命名规则</p>
                文件名（去掉扩展名）需与<strong>订单编号</strong>完全一致，系统会自动匹配对应订单。
                例如：<span className="font-mono bg-white px-1 rounded">ORD-TBWL-20260501-0001.pdf</span>
                {restrictToIds && restrictToIds.length > 0 && (
                  <p className="mt-1 text-amber-600">当前仅在勾选的 {restrictToIds.length} 条订单中匹配。</p>
                )}
              </div>
            </>
          )}

          {phase === 'matching' && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-[#3c8dbc] animate-spin" />
              <p className="text-gray-600">正在匹配订单…</p>
            </div>
          )}

          {(phase === 'preview' || phase === 'uploading' || phase === 'done') && (
            <div>
              {/* 统计条 */}
              <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" /> 可上传 {matchedCount}
                </span>
                {unmatchedCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="w-4 h-4" /> 未匹配 {unmatchedCount}
                  </span>
                )}
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertTriangle className="w-4 h-4" /> 文件无效 {invalidCount}
                  </span>
                )}
                {phase === 'done' && (
                  <span className="text-gray-500">
                    （成功 {successCount}，失败 {failCount}）
                  </span>
                )}
              </div>

              {phase === 'uploading' && (
                <div className="mb-3">
                  <div className="h-2 bg-gray-100 rounded overflow-hidden">
                    <div className="h-full bg-[#3c8dbc] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">{progress}%</p>
                </div>
              )}

              {/* 文件列表 */}
              <div className="border border-gray-200 rounded max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 border-r border-gray-200 text-xs font-semibold text-gray-700">文件名</th>
                      <th className="px-3 py-2 border-r border-gray-200 text-xs font-semibold text-gray-700">匹配订单</th>
                      <th className="px-3 py-2 border-r border-gray-200 text-xs font-semibold text-gray-700 w-28">状态</th>
                      {phase === 'preview' && <th className="px-3 py-2 text-xs font-semibold text-gray-700 w-12"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-1.5 border-r border-gray-200 text-xs font-mono max-w-[220px] truncate" title={row.file.name}>
                          {row.file.name}
                        </td>
                        <td className="px-3 py-1.5 border-r border-gray-200 text-xs font-mono">
                          {row.order ? (
                            <span className="text-gray-700">
                              {row.orderNumber}
                              {row.order.waybill_path && (
                                <span className="ml-1 text-[10px] text-amber-500">(将覆盖)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-amber-500">未匹配「{row.orderNumber}」</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 border-r border-gray-200 text-xs">
                          {row.fileError ? (
                            <span className="text-red-500" title={row.fileError}>文件无效</span>
                          ) : row.status === 'uploading' ? (
                            <span className="flex items-center gap-1 text-[#3c8dbc]">
                              <Loader2 className="w-3 h-3 animate-spin" /> 上传中
                            </span>
                          ) : row.status === 'success' ? (
                            <span className="text-green-600">✓ 成功</span>
                          ) : row.status === 'error' ? (
                            <span className="text-red-500" title={row.message}>✗ 失败</span>
                          ) : row.order ? (
                            <span className="text-gray-400">待上传</span>
                          ) : (
                            <span className="text-gray-300">跳过</span>
                          )}
                        </td>
                        {phase === 'preview' && (
                          <td className="px-3 py-1.5 text-center">
                            <button
                              onClick={() => removeRow(idx)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                              title="移除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(unmatchedCount > 0 || invalidCount > 0) && phase === 'preview' && (
                <p className="text-xs text-gray-400 mt-2">
                  未匹配或无效的文件将被自动跳过，不会上传。
                </p>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          {phase === 'preview' && (
            <>
              <button
                onClick={() => { setPhase('select'); setRows([]); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
              >
                重新选择
              </button>
              <button
                onClick={startUpload}
                disabled={matchedCount === 0}
                className="px-4 py-2 text-sm bg-[#3c8dbc] hover:bg-[#367fa9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
              >
                开始上传 ({matchedCount} 条)
              </button>
            </>
          )}
          {(phase === 'select' || phase === 'matching' || phase === 'uploading') && (
            <button
              onClick={onClose}
              disabled={phase === 'uploading'}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            >
              {phase === 'uploading' ? '上传中…' : '取消'}
            </button>
          )}
          {phase === 'done' && (
            <button
              onClick={() => { onUploadComplete(); onClose(); }}
              className="px-4 py-2 text-sm bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded font-medium transition-colors"
            >
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
