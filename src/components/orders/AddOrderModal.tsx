'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

const SHIPPING_METHODS = ['空运', '海运', '陆运'];
const STATUSES = ['待处理', '已提交/待打包', '转运中', '预刷件', '取消中', '异常件', '待确认入店', '已送店', '退件重发', '已关闭'];

export function AddOrderModal({ onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    order_number: '',
    shipping_method: '空运',
    product_list: '',
    remarks: '',
    status: '待处理',
    tracking_info: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.order_number.trim()) {
      setError('订单编号不能为空');
      return;
    }
    if (!form.product_list.trim()) {
      setError('商品清单不能为空');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { error: dbError } = await supabase.from('orders').insert({
        order_number: form.order_number.trim(),
        shipping_method: form.shipping_method,
        product_list: form.product_list.trim(),
        remarks: form.remarks.trim(),
        status: form.status,
        tracking_info: form.tracking_info.trim(),
      });
      if (dbError) throw dbError;
      onAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-base font-bold">手工添加订单</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">订单编号 <span className="text-red-500">*</span></label>
            <input
              name="order_number"
              value={form.order_number}
              onChange={handleChange}
              placeholder="例: ORD-TBWL-20260531-0001"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">物流方式</label>
              <select
                name="shipping_method"
                value={form.shipping_method}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SHIPPING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">状态</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">商品清单 <span className="text-red-500">*</span></label>
            <textarea
              name="product_list"
              value={form.product_list}
              onChange={handleChange}
              rows={3}
              placeholder="例: 手机壳 x50, 钢化膜 x30"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">货况信息</label>
            <input
              name="tracking_info"
              value={form.tracking_info}
              onChange={handleChange}
              placeholder="物流追踪号（可选）"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">备注/留言</label>
            <input
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="可选"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-[#228b22] text-white rounded hover:bg-[#1e7a1e] disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? '提交中…' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
