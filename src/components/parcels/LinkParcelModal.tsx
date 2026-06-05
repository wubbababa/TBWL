'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Link2, Loader2, CheckCircle2, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Parcel {
  id: string;
  tracking_number: string;
  weight: number | null;
  volume: number | null;
  status: string;
}

interface Order {
  order_number: string;
  shipping_method: string;
  product_list: string;
  status: string;
  tracking_info: string;
}

interface Props {
  parcel: Parcel;
  onClose: () => void;
  onLinked: () => void;
}

export function LinkParcelModal({ parcel, onClose, onLinked }: Props) {
  const [autoResults, setAutoResults] = useState<Order[]>([]);
  const [manualResults, setManualResults] = useState<Order[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [autoLoading, setAutoLoading] = useState(true);
  const [manualLoading, setManualLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Auto-match: search orders by tracking_info containing this parcel's tracking_number
  useEffect(() => {
    const autoMatch = async () => {
      setAutoLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('order_number, shipping_method, product_list, status, tracking_info')
          .ilike('tracking_info', `%${parcel.tracking_number}%`)
          .limit(10);
        if (fetchError) throw fetchError;
        setAutoResults(data ?? []);
      } catch {
        setAutoResults([]);
      } finally {
        setAutoLoading(false);
      }
    };
    autoMatch();
  }, [parcel.tracking_number]);

  // Manual search by order_number
  const handleManualSearch = useCallback(async () => {
    if (!searchInput.trim()) return;
    setManualLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('order_number, shipping_method, product_list, status, tracking_info')
        .ilike('order_number', `%${searchInput.trim()}%`)
        .limit(10);
      if (fetchError) throw fetchError;
      setManualResults(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '搜索失败');
    } finally {
      setManualLoading(false);
    }
  }, [searchInput]);

  // Confirm link: update both tables
  const handleConfirm = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    setError('');
    try {
      // 1. Update parcel: set order_number + status
      const { error: parcelError } = await supabase
        .from('unassociated_parcels')
        .update({ order_number: selectedOrder.order_number, status: '已关联' })
        .eq('id', parcel.id);
      if (parcelError) throw parcelError;

      // 2. Update order: append tracking_number to tracking_info
      const existing = (selectedOrder.tracking_info ?? '').trim();
      const newTrackingInfo = existing
        ? `${existing}\n${parcel.tracking_number}`
        : parcel.tracking_number;
      const { error: orderError } = await supabase
        .from('orders')
        .update({ tracking_info: newTrackingInfo })
        .eq('order_number', selectedOrder.order_number);
      if (orderError) throw orderError;

      onLinked();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '关联失败');
    } finally {
      setSaving(false);
    }
  };

  const renderOrderRow = (order: Order, highlighted = false) => (
    <div
      key={order.order_number}
      onClick={() => setSelectedOrder(order)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer border transition-colors ${
        selectedOrder?.order_number === order.order_number
          ? 'border-[#3c8dbc] bg-blue-50'
          : highlighted
            ? 'border-yellow-300 bg-yellow-50 hover:border-[#3c8dbc]'
            : 'border-gray-200 hover:border-[#3c8dbc] hover:bg-gray-50'
      }`}
    >
      <input
        type="radio"
        checked={selectedOrder?.order_number === order.order_number}
        onChange={() => setSelectedOrder(order)}
        className="accent-[#3c8dbc] shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-gray-800">{order.order_number}</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600 border border-gray-200">{order.shipping_method}</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600 border border-gray-200">{order.status}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{order.product_list || '暂无商品信息'}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#3c8dbc]" />
            <h2 className="text-base font-bold">关联包裹到订单</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
          )}

          {/* Parcel info */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-bold text-gray-700">当前包裹</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div>物流单号: <span className="font-mono font-bold text-gray-800">{parcel.tracking_number}</span></div>
              <div>重量: <span className="font-bold text-gray-800">{parcel.weight ?? '-'} kg</span></div>
              <div>体积: <span className="font-bold text-gray-800">{parcel.volume ?? '-'} m³</span></div>
            </div>
          </div>

          {/* Auto-match section */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">自动匹配</h3>
            {autoLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在搜索匹配的订单...
              </div>
            ) : autoResults.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  找到 {autoResults.length} 个可能匹配的订单
                </p>
                {autoResults.map(o => renderOrderRow(o, true))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-2">未找到自动匹配的订单，请手动搜索</p>
            )}
          </div>

          {/* Manual search section */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">手动搜索订单</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                placeholder="输入订单编号"
                className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none"
              />
              <button
                onClick={handleManualSearch}
                disabled={manualLoading}
                className="flex items-center gap-1.5 h-9 px-4 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9] disabled:opacity-50"
              >
                {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>搜索</span>
              </button>
            </div>
            {manualResults.length > 0 && (
              <div className="mt-2 space-y-2">
                {manualResults.map(o => renderOrderRow(o))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-3 border-t shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedOrder || saving}
            className="px-4 py-2 text-sm bg-[#228b22] text-white rounded hover:bg-[#1e7a1e] disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? '关联中...' : '确认关联'}
          </button>
        </div>
      </div>
    </div>
  );
}
