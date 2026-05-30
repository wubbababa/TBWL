'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, Loader2, AlertCircle, FileText, ZoomIn, ZoomOut } from 'lucide-react';
import {
  getWaybillSignedUrl, downloadWaybill, getWaybillKind,
  type OrderWaybillFields, type WaybillKind,
} from '@/lib/waybill';

interface Props {
  order: OrderWaybillFields;
  onClose: () => void;
}

/**
 * 面单预览弹窗：图片内嵌渲染，PDF 用 <iframe> 内嵌，其它类型提供下载/新标签打开。
 */
export const WaybillPreviewModal = ({ order, onClose }: Props) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom] = useState(1);

  const kind: WaybillKind = getWaybillKind(order.waybill_filename || order.waybill_path);
  const displayName = order.waybill_filename || '面单文件';

  // 加载签名 URL（给 PDF 多一些有效期，避免长时间预览失效）
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!order.waybill_path) throw new Error('该订单暂无面单');
        const signed = await getWaybillSignedUrl(order.waybill_path, { expiresIn: 600 });
        if (active) setUrl(signed);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : '加载面单失败');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [order.waybill_path]);

  // Esc 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadWaybill(order);
    } catch {
      /* 下载失败时下方仍可用新标签打开 */
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[88vh] flex flex-col mx-4">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-[#3c8dbc] shrink-0" />
            <span className="truncate">面单预览 — {displayName}</span>
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            {kind === 'image' && url && (
              <>
                <button
                  onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600"
                  title="缩小"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600"
                  title="放大"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="w-px h-5 bg-gray-200 mx-1" />
              </>
            )}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600"
                title="在新标签页打开"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              下载
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#3c8dbc]" />
              <span>正在加载面单…</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-red-500">
              <AlertCircle className="w-8 h-8" />
              <span className="text-sm">{error}</span>
            </div>
          ) : url && kind === 'image' ? (
            <div className="p-4 w-full h-full overflow-auto flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={displayName}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                className="max-w-full max-h-full object-contain transition-transform shadow-md bg-white"
              />
            </div>
          ) : url && kind === 'pdf' ? (
            <iframe
              src={url}
              title={displayName}
              className="w-full h-full border-0 bg-white"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <FileText className="w-10 h-10 text-gray-300" />
              <span className="text-sm">该文件类型暂不支持内嵌预览</span>
              <div className="flex items-center gap-2">
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-white text-gray-600 rounded text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> 在新标签页打开
                  </a>
                )}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" /> 下载文件
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
