'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateClaimModal({ onClose, onCreated }: Props) {
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [reason, setReason] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!orderNumber.trim()) { toast('请输入订单编号', 'warning'); return; }
    if (!reason.trim()) { toast('请输入索赔原因', 'warning'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('claims').insert({
        order_number: orderNumber.trim(),
        tracking_number: trackingNumber.trim() || null,
        reason: reason.trim(),
        claim_amount: claimAmount ? Number(claimAmount) : null,
        status: '处理中',
      });
      if (error) throw error;
      toast('索赔已提交', 'success');
      onCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      toast('提交失败：' + msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-800">发起新索赔</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">订单编号 <span className="text-red-500">*</span></label>
            <input type="text" placeholder="请输入订单编号" value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">物流单号</label>
            <input type="text" placeholder="请输入物流单号（可选）" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">索赔原因 <span className="text-red-500">*</span></label>
            <textarea rows={3} placeholder="请描述索赔原因" value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none resize-none" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">索赔金额 (CNY)</label>
            <input type="number" placeholder="请输入金额（可选）" value={claimAmount} onChange={e => setClaimAmount(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">取消</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-4 py-1.5 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50">
            {saving ? '提交中...' : '提交索赔'}
          </button>
        </div>
      </div>
    </div>
  );
}
