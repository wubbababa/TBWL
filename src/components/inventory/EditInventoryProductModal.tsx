'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InventoryProduct {
  id: string;
  store_name: string;
  sku: string;
  name: string;
  thumbnail?: string;
  price: number;
  total_count: number;
  remaining_count: number;
  idle_days: number;
  status: string;
  created_at: string;
}

interface Props {
  product: InventoryProduct;
  onClose: () => void;
  onUpdated: () => void;
}

interface FormData {
  store_name: string;
  sku: string;
  name: string;
  price: string;
  total_count: string;
  remaining_count: string;
  status: string;
  thumbnail: string;
}

function productToForm(p: InventoryProduct): FormData {
  return {
    store_name: p.store_name,
    sku: p.sku,
    name: p.name,
    price: String(p.price),
    total_count: String(p.total_count),
    remaining_count: String(p.remaining_count),
    status: p.status,
    thumbnail: p.thumbnail ?? '',
  };
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export function EditInventoryProductModal({ product, onClose, onUpdated }: Props) {
  const [form, setForm] = useState<FormData>(() => productToForm(product));
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

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.store_name) errs.store_name = '请选择仓点';
    if (!form.sku.trim()) errs.sku = '请输入商品编号';
    if (!form.name.trim()) errs.name = '请输入商品名';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = '请输入有效价格';
    if (!form.total_count || isNaN(Number(form.total_count)) || Number(form.total_count) < 0) errs.total_count = '请输入有效数量';
    if (!form.remaining_count || isNaN(Number(form.remaining_count)) || Number(form.remaining_count) < 0) errs.remaining_count = '请输入有效数量';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('inventory_products').update({
        store_name: form.store_name,
        sku: form.sku.trim(),
        name: form.name.trim(),
        price: Number(form.price),
        total_count: Number(form.total_count),
        remaining_count: Number(form.remaining_count),
        status: form.status,
        thumbnail: form.thumbnail.trim() || null,
      }).eq('id', product.id);
      if (error) throw error;
      setToast({ type: 'success', message: '商品更新成功' });
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '更新失败，请重试';
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
          <h2 className="text-base font-bold text-gray-800">编辑库存商品</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700" aria-label="关闭">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* 仓点 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">仓点 <span className="text-red-500">*</span></label>
            <select value={form.store_name} onChange={set('store_name')}
              className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none bg-white ${errors.store_name ? 'border-red-400' : 'border-gray-300'}`}>
              <option value="">请选择仓点</option>
              <option value="深圳仓">深圳仓</option>
              <option value="台北仓">台北仓</option>
              <option value="台中仓">台中仓</option>
              <option value="高雄仓">高雄仓</option>
            </select>
            {errors.store_name && <span className="text-xs text-red-500">{errors.store_name}</span>}
          </div>

          {/* SKU */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">商品编号/SKU <span className="text-red-500">*</span></label>
            <input type="text" value={form.sku} onChange={set('sku')} placeholder="例：SKU-001"
              className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none ${errors.sku ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.sku && <span className="text-xs text-red-500">{errors.sku}</span>}
          </div>

          {/* 商品名 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">商品名 <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="请输入商品名称"
              className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none ${errors.name ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          {/* 价格 / 总数 / 剩余 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">价格 (¥) <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00"
                className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none ${errors.price ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">总数 <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.total_count} onChange={set('total_count')} placeholder="0"
                className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none ${errors.total_count ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.total_count && <span className="text-xs text-red-500">{errors.total_count}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">剩余数量 <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.remaining_count} onChange={set('remaining_count')} placeholder="0"
                className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none ${errors.remaining_count ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.remaining_count && <span className="text-xs text-red-500">{errors.remaining_count}</span>}
            </div>
          </div>

          {/* 缩略图 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">缩略图 URL</label>
            <input type="text" value={form.thumbnail} onChange={set('thumbnail')} placeholder="https://..."
              className="h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>

          {/* 状态 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">状态</label>
            <select value={form.status} onChange={set('status')}
              className="h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none bg-white">
              <option value="在库">在库</option>
              <option value="已出库">已出库</option>
              <option value="待处理">待处理</option>
            </select>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors">
              取消
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm bg-[#3c8dbc] hover:bg-[#367fa9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors">
              {saving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
