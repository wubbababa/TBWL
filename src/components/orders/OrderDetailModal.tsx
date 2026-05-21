'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Edit2, Save, RotateCcw, Trash2 } from 'lucide-react';
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
  /** 删除成功后回调（可选，不传则不显示删除按钮） */
  onDeleted?: () => void;
}

export const OrderDetailModal = ({ order, onClose, onUpdated, onDeleted }: Props) => {
  // 编辑模式开关
  const [editMode, setEditMode] = useState(false);

  // 可编辑字段
  const [orderNumber, setOrderNumber] = useState(order.order_number);
  const [shippingMethod, setShippingMethod] = useState(order.shipping_method);
  const [productList, setProductList] = useState(order.product_list);
  const [remarks, setRemarks] = useState(order.remarks ?? '');
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [trackingInfo, setTrackingInfo] = useState(order.tracking_info ?? '');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
      if (e.key === 'Escape') {
        if (confirmDelete) { setConfirmDelete(false); return; }
        if (editMode) { handleCancelEdit(); return; }
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, editMode, confirmDelete]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
  };

  const handleCancelEdit = () => {
    setOrderNumber(order.order_number);
    setShippingMethod(order.shipping_method);
    setProductList(order.product_list);
    setRemarks(order.remarks ?? '');
    setSelectedStatus(order.status);
    setTrackingInfo(order.tracking_info ?? '');
    setEditMode(false);
  };

  /** 保存所有修改 */
  const handleSaveAll = async () => {
    if (!orderNumber.trim()) {
      showToast('error', '订单编号不能为空');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          order_number: orderNumber.trim(),
          shipping_method: shippingMethod.trim(),
          product_list: productList.trim(),
          remarks: remarks.trim() || null,
          status: selectedStatus,
          tracking_info: trackingInfo.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);
      if (error) throw error;
      showToast('success', '订单已保存');
      setEditMode(false);
      onUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失败';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  /** 删除订单 */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data: deleted, error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id)
        .select('id');

      if (error) throw error;

      if (!deleted || deleted.length === 0) {
        throw new Error(
          '删除被拒绝（RLS 策略限制）。请在 Supabase 控制台执行 supabase/fix_orders_rls.sql 修复权限。',
        );
      }

      showToast('success', '订单已删除');
      setTimeout(() => {
        onClose();
        onDeleted?.();
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '删除失败';
      showToast('error', msg);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  const inputCls = 'border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]/40 focus:border-[#3c8dbc] w-full bg-white';
  const readonlyCls = 'text-gray-800 text-sm break-all';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget && !editMode) onClose(); }}
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

      {/* 删除确认对话框 */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-800">确认删除</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              确定要删除订单 <span className="font-bold text-gray-800">{order.order_number}</span> 吗？
            </p>
            <p className="text-xs text-red-500 mb-5">此操作不可撤销。</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-4 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? '删除中…' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal card */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            {editMode
              ? <><Edit2 className="w-4 h-4 text-[#3c8dbc]" /><span>编辑订单</span></>
              : <span>订单详情</span>}
            <span className="text-[#3c8dbc]">— {order.order_number}</span>
          </h2>
          <div className="flex items-center gap-2">
            {!editMode && (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded text-xs font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  编辑
                </button>
                {onDeleted && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* 基本信息 */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">基本信息</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {/* 订单编号 */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-xs">订单编号</label>
                {editMode
                  ? <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className={inputCls} placeholder="订单编号" />
                  : <span className={readonlyCls}>{order.order_number}</span>}
              </div>
              {/* 物流方式 */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-xs">物流方式</label>
                {editMode
                  ? <input value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} className={inputCls} placeholder="物流方式" />
                  : <span className={readonlyCls}>{order.shipping_method}</span>}
              </div>
              {/* 创建时间（只读） */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-xs">创建时间</label>
                <span className={readonlyCls}>{formatDate(order.created_at)}</span>
              </div>
              {/* 更新时间（只读） */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-xs">更新时间</label>
                <span className={readonlyCls}>{formatDate(order.updated_at)}</span>
              </div>
              {/* 商品清单 */}
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-gray-400 text-xs">商品清单</label>
                {editMode
                  ? <textarea value={productList} onChange={(e) => setProductList(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="商品清单" />
                  : <span className={readonlyCls}>{order.product_list}</span>}
              </div>
              {/* 备注/留言 */}
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-gray-400 text-xs">备注/留言</label>
                {editMode
                  ? <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="备注（选填）" />
                  : <span className={readonlyCls}>{order.remarks || '-'}</span>}
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 状态管理 */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">状态管理</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20 shrink-0">
                {editMode ? '修改状态' : '当前状态'}
              </span>
              {editMode ? (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]/40 focus:border-[#3c8dbc] bg-white"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${statusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              )}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 货况信息 */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">货况信息 / 物流单号</h3>
            {editMode ? (
              <input
                type="text"
                value={trackingInfo}
                onChange={(e) => setTrackingInfo(e.target.value)}
                placeholder="输入物流单号或货况信息"
                className={`${inputCls} font-mono`}
              />
            ) : (
              <span className="text-sm text-gray-800 font-mono">
                {order.tracking_info || <span className="text-gray-400 italic">暂无物流信息</span>}
              </span>
            )}
          </section>

          {/* 编辑模式操作按钮 */}
          {editMode && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#3c8dbc] hover:bg-[#367fa9] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中…' : '保存修改'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
            </div>
          )}
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
