'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface Order {
  id: string | number;
  order_number: string;
  shipping_method: string;
  product_list: string;
  remarks?: string;
  status: string;
  tracking_info: string;
  created_at: string;
  updated_at?: string;
}

const ALL_STATUSES = [
  '待处理',
  '已提交/待打包',
  '转运中',
  '预刷件',
  '取消中',
  '异常件',
  '待确认入店',
  '已送店',
  '退件重发',
  '已关闭',
];

const STATUS_COLORS: Record<string, string> = {
  '待处理': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  '已提交/待打包': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  '转运中': 'bg-blue-50 text-blue-700 border-blue-200',
  '预刷件': 'bg-purple-50 text-purple-700 border-purple-200',
  '取消中': 'bg-orange-50 text-orange-700 border-orange-200',
  '异常件': 'bg-red-50 text-red-700 border-red-200',
  '待确认入店': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  '已送店': 'bg-green-50 text-green-700 border-green-200',
  '退件重发': 'bg-pink-50 text-pink-700 border-pink-200',
  '已关闭': 'bg-gray-100 text-gray-500 border-gray-200',
};

function statusBadgeClass(status: string): string {
  return STATUS_COLORS[status] ?? 'bg-blue-50 text-blue-600 border-blue-100';
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

interface Props {
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
}

export const OrderDetailModal = ({ order, onClose, onUpdated }: Props) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [trackingInfo, setTrackingInfo] = useState(order.tracking_info ?? '');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Auto-dismiss toast after 3 s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
  };

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: selectedStatus, updated_at: new Date().toISOString() })
        .eq('id', order.id);
      if (error) throw error;
      showToast('success', '状态已更新');
      onUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '更新失败';
      showToast('error', msg);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveTracking = async () => {
    setSavingTracking(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_info: trackingInfo, updated_at: new Date().toISOString() })
        .eq('id', order.id);
      if (error) throw error;
      showToast('success', '物流信息已更新');
      onUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '更新失败';
      showToast('error', msg);
    } finally {
      setSavingTracking(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded shadow-lg text-sm font-medium transition-all
            ${toast.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Modal card */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-800">
            订单详情 — <span className="text-[#3c8dbc]">{order.order_number}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* Basic info */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">基本信息</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <InfoRow label="订单编号" value={order.order_number} />
              <InfoRow label="物流方式" value={order.shipping_method} />
              <InfoRow label="创建时间" value={formatDate(order.created_at)} />
              <InfoRow label="更新时间" value={formatDate(order.updated_at)} />
              <div className="col-span-2">
                <InfoRow label="商品清单" value={order.product_list} />
              </div>
              <div className="col-span-2">
                <InfoRow label="备注/留言" value={order.remarks || '-'} />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Status change */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">状态管理</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-20 shrink-0">当前状态</span>
                <span
                  className={`px-2.5 py-0.5 rounded border text-xs font-bold ${statusBadgeClass(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-20 shrink-0">修改为</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]/40 focus:border-[#3c8dbc] bg-white"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  onClick={handleSaveStatus}
                  disabled={savingStatus || selectedStatus === order.status}
                  className="bg-[#3c8dbc] hover:bg-[#367fa9] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  {savingStatus ? '保存中…' : '保存状态'}
                </button>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Tracking info */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">货况信息 / 物流单号</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={trackingInfo}
                onChange={(e) => setTrackingInfo(e.target.value)}
                placeholder="输入物流单号或货况信息"
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]/40 focus:border-[#3c8dbc] w-full font-mono"
              />
              <div>
                <button
                  onClick={handleSaveTracking}
                  disabled={savingTracking}
                  className="bg-[#3c8dbc] hover:bg-[#367fa9] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  {savingTracking ? '保存中…' : '保存物流'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 text-sm shrink-0 w-20">{label}</span>
      <span className="text-gray-800 text-sm break-all">{value}</span>
    </div>
  );
}
