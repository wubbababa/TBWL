'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface FormData {
  barcode: string;
  warehouse: string;
  tracking_number: string;
  sku: string;
  location: string;
  quantity: string;
  remarks: string;
}

const INITIAL_FORM: FormData = {
  barcode: '',
  warehouse: '',
  tracking_number: '',
  sku: '',
  location: '',
  quantity: '1',
  remarks: '',
};

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export function CreateInventoryApplyModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.barcode.trim()) errs.barcode = '请输入仓单条码';
    if (!form.warehouse) errs.warehouse = '请选择仓库';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 1) errs.quantity = '数量至少为1';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('inventory_apply').insert({
        barcode: form.barcode.trim(),
        warehouse: form.warehouse,
        tracking_number: form.tracking_number.trim() || null,
        sku: form.sku.trim() || null,
        location: form.location.trim() || null,
        quantity: Number(form.quantity),
        remarks: form.remarks.trim() || null,
        status: '待入库',
      });
      if (error) throw error;
      setToast({ type: 'success', message: '入库申请已提交' });
      setTimeout(() => {
        onCreated();
        onClose();
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '提交失败，请重试';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded shadow-lg text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-800">申请入库</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700" aria-label="关闭">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* 仓单条码 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">仓单条码 <span className="text-red-500">*</span></label>
            <input type="text" value={form.barcode} onChange={set('barcode')} placeholder="请输入仓单条码"
              className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none font-mono ${errors.barcode ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.barcode && <span className="text-xs text-red-500">{errors.barcode}</span>}
          </div>

          {/* 仓库 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">仓库 <span className="text-red-500">*</span></label>
            <select value={form.warehouse} onChange={set('warehouse')}
              className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none bg-white ${errors.warehouse ? 'border-red-400' : 'border-gray-300'}`}>
              <option value="">请选择仓库</option>
              <option value="深圳仓">深圳仓</option>
              <option value="台北仓">台北仓</option>
              <option value="台中仓">台中仓</option>
              <option value="高雄仓">高雄仓</option>
            </select>
            {errors.warehouse && <span className="text-xs text-red-500">{errors.warehouse}</span>}
          </div>

          {/* 快递单号 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">快递单号</label>
            <input type="text" value={form.tracking_number} onChange={set('tracking_number')} placeholder="选填"
              className="h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none font-mono" />
          </div>

          {/* SKU / 商品名 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">SKU / 商品名</label>
            <input type="text" value={form.sku} onChange={set('sku')} placeholder="选填"
              className="h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>

          {/* 库位号 / 数量 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">库位号</label>
              <input type="text" value={form.location} onChange={set('location')} placeholder="选填"
                className="h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">数量 <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={form.quantity} onChange={set('quantity')}
                className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none ${errors.quantity ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.quantity && <span className="text-xs text-red-500">{errors.quantity}</span>}
            </div>
          </div>

          {/* 备注 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">备注</label>
            <textarea value={form.remarks} onChange={set('remarks')} placeholder="选填" rows={2}
              className="px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none resize-none" />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors">
              取消
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm bg-[#3c8dbc] hover:bg-[#367fa9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors">
              {saving ? '提交中…' : '确认提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
