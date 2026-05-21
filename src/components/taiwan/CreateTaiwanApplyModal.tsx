'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface ProductItem {
  sku: string;
  name: string;
  quantity: string;
}

interface FormData {
  member_code: string;
  manifest_type: string;
  warehouse: string;
  tracking_number: string;
  remarks: string;
}

const INITIAL_FORM: FormData = {
  member_code: '',
  manifest_type: '一般货物',
  warehouse: '台北仓',
  tracking_number: '',
  remarks: '',
};

const INITIAL_PRODUCT: ProductItem = { sku: '', name: '', quantity: '1' };

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export function CreateTaiwanApplyModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [products, setProducts] = useState<ProductItem[]>([{ ...INITIAL_PRODUCT }]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'products', string>>>({});

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

  const setField = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const setProduct = (index: number, field: keyof ProductItem) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, [field]: e.target.value } : p));
    setErrors(prev => ({ ...prev, products: undefined }));
  };

  const addProduct = () => setProducts(prev => [...prev, { ...INITIAL_PRODUCT }]);

  const removeProduct = (index: number) => {
    if (products.length === 1) return;
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData | 'products', string>> = {};
    if (!form.member_code.trim()) errs.member_code = '请输入会员/代理编号';
    const hasValidProduct = products.some(p => p.sku.trim() || p.name.trim());
    if (!hasValidProduct) errs.products = '至少填写一件商品的SKU或商品名';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const validProducts = products.filter(p => p.sku.trim() || p.name.trim());
      const productCount = validProducts.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);

      const { error } = await supabase.from('taiwan_apply').insert({
        member_code: form.member_code.trim(),
        product_count: productCount,
        manifest_type: form.manifest_type,
        remarks: form.remarks.trim() || null,
        status: '待处理',
      });
      if (error) throw error;
      setToast({ type: 'success', message: '发货申请已提交' });
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

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-800">申请仓储发货</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700" aria-label="关闭">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* 会员/代理编号 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">會員/代理編號 <span className="text-red-500">*</span></label>
            <input type="text" value={form.member_code} onChange={setField('member_code')} placeholder="请输入会员或代理编号"
              className={`h-9 px-3 text-sm border rounded focus:border-[#3c8dbc] focus:outline-none font-mono ${errors.member_code ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.member_code && <span className="text-xs text-red-500">{errors.member_code}</span>}
          </div>

          {/* 收货仓库 / 舱单类型 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">收貨倉庫</label>
              <select value={form.warehouse} onChange={setField('warehouse')}
                className="h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none bg-white">
                <option value="台北仓">臺北倉</option>
                <option value="台中仓">臺中倉</option>
                <option value="高雄仓">高雄倉</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">艙單類型</label>
              <select value={form.manifest_type} onChange={setField('manifest_type')}
                className="h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none bg-white">
                <option value="一般货物">一般貨物</option>
                <option value="快递小包">快遞小包</option>
                <option value="空运">空運</option>
                <option value="海运">海運</option>
              </select>
            </div>
          </div>

          {/* 快递单号 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">快遞單號</label>
            <input type="text" value={form.tracking_number} onChange={setField('tracking_number')} placeholder="选填"
              className="h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none font-mono" />
          </div>

          {/* 商品列表 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">商品清單 <span className="text-red-500">*</span></label>
              <button type="button" onClick={addProduct}
                className="flex items-center gap-1 text-xs text-[#3c8dbc] hover:text-[#367fa9] font-medium">
                <Plus className="w-3.5 h-3.5" />添加商品
              </button>
            </div>
            {errors.products && <span className="text-xs text-red-500">{errors.products}</span>}
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_80px_32px] gap-0 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 px-3 py-2">
                <span>SKU</span>
                <span>商品名</span>
                <span className="text-center">數量</span>
                <span></span>
              </div>
              {products.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_80px_32px] gap-0 border-b border-gray-100 last:border-0 items-center px-2 py-1.5">
                  <input type="text" value={p.sku} onChange={setProduct(i, 'sku')} placeholder="SKU"
                    className="h-8 px-2 text-xs border border-gray-200 rounded mr-1 focus:border-[#3c8dbc] focus:outline-none font-mono" />
                  <input type="text" value={p.name} onChange={setProduct(i, 'name')} placeholder="商品名"
                    className="h-8 px-2 text-xs border border-gray-200 rounded mr-1 focus:border-[#3c8dbc] focus:outline-none" />
                  <input type="number" min="1" value={p.quantity} onChange={setProduct(i, 'quantity')}
                    className="h-8 px-2 text-xs border border-gray-200 rounded text-center focus:border-[#3c8dbc] focus:outline-none" />
                  <button type="button" onClick={() => removeProduct(i)} disabled={products.length === 1}
                    className="flex items-center justify-center w-7 h-7 ml-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">備註</label>
            <textarea value={form.remarks} onChange={setField('remarks')} placeholder="选填" rows={2}
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
              {saving ? '提交中…' : '確認提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
