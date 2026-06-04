'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { X, Package, Loader2, AlertTriangle, CheckCircle, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  remaining_count: number;
  store_name: string;
}

interface OrderItem {
  orderId: string;
  orderNumber: string;
  productList: string;
  productId: string;
  quantity: number;
}

interface Props {
  orderIds: string[];
  onClose: () => void;
  onComplete: () => void;
}

export const BatchInventoryModal = ({ orderIds, onClose, onComplete }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [submitting, onClose]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: orders, error: orderErr } = await supabase
        .from('orders')
        .select('id, order_number, product_list')
        .in('id', orderIds);

      const { data: inventoryProducts, error: prodErr } = await supabase
        .from('inventory_products')
        .select('id, sku, name, remaining_count, store_name')
        .order('sku');

      if (orderErr || prodErr) {
        toast('加载数据失败', 'error');
        setLoading(false);
        return;
      }

      const prods = (inventoryProducts ?? []) as InventoryProduct[];
      setProducts(prods);

      const mapped: OrderItem[] = (orders ?? []).map((o: any) => {
        const text: string = o.product_list ?? '';
        const matched = prods.find(p => text.toLowerCase().includes(p.sku.toLowerCase()));
        return {
          orderId: o.id as string,
          orderNumber: o.order_number as string,
          productList: text,
          productId: matched?.id ?? '',
          quantity: matched ? 1 : 0,
        };
      });
      setItems(mapped);
      setLoading(false);
    };
    load();
  }, [orderIds]);

  const updateItem = (idx: number, patch: Partial<OrderItem>) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, ...patch } : item));
  };

  const unmatchedCount = useMemo(() => items.filter(i => !i.productId).length, [items]);

  const deductionSummary = useMemo(() => {
    const map = new Map<string, { product: InventoryProduct; totalQty: number }>();
    items.forEach(i => {
      if (!i.productId || i.quantity <= 0) return;
      const prod = products.find(p => p.id === i.productId);
      if (!prod) return;
      const existing = map.get(i.productId);
      if (existing) {
        existing.totalQty += i.quantity;
      } else {
        map.set(i.productId, { product: prod, totalQty: i.quantity });
      }
    });
    return Array.from(map.values());
  }, [items, products]);

  const totalDeduction = useMemo(
    () => deductionSummary.reduce((s, d) => s + d.totalQty, 0),
    [deductionSummary],
  );

  const hasInsufficient = useMemo(
    () => deductionSummary.some(d => d.totalQty > d.product.remaining_count),
    [deductionSummary],
  );

  const handleSubmit = async () => {
    const activeItems = items.filter(i => i.productId && i.quantity > 0);
    if (activeItems.length === 0) {
      toast('请至少选择一个扣减项', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      for (const item of activeItems) {
        const prod = products.find(p => p.id === item.productId);
        if (!prod) continue;

        const { data: current, error: readErr } = await supabase
          .from('inventory_products')
          .select('remaining_count')
          .eq('id', item.productId)
          .single();

        if (readErr || !current) throw new Error('读取库存失败');

        const newCount = (current.remaining_count as number) - item.quantity;
        const { error: updateErr } = await supabase
          .from('inventory_products')
          .update({ remaining_count: newCount })
          .eq('id', item.productId);

        if (updateErr) throw new Error('更新库存失败');

        const { error: insertErr } = await supabase
          .from('inventory_records')
          .insert({
            product_id: item.productId,
            order_number: item.orderNumber,
            sku: prod.sku,
            quantity: item.quantity,
            description: `订单 ${item.orderNumber} 扣减`,
            status: '已完成',
          });

        if (insertErr) throw new Error('写入扣减记录失败');
      }

      toast('库存扣减完成', 'success');
      onComplete();
    } catch (err: any) {
      toast(err.message || '扣减失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">批量库存扣减</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">订单列表</h3>
                  {unmatchedCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      {unmatchedCount} 个未匹配
                    </span>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-[50vh] overflow-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">订单号</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">商品</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">库存产品</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-center">数量</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={item.orderId} className="border-b border-gray-100 hover:bg-blue-50/40">
                            <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap">{item.orderNumber}</td>
                            <td className="px-3 py-2 text-sm text-gray-600 max-w-[120px] truncate" title={item.productList}>
                              {item.productList || '-'}
                            </td>
                            <td className="px-3 py-2">
                              <select
                                className="text-xs border border-gray-200 rounded px-2 py-1 w-full max-w-[200px] bg-white"
                                value={item.productId}
                                onChange={e => {
                                  const pid = e.target.value;
                                  updateItem(idx, { productId: pid, quantity: pid ? 1 : 0 });
                                }}
                              >
                                <option value="">— 不扣减 —</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.sku} / {p.name} (剩余: {p.remaining_count})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number"
                                min={1}
                                className="w-16 text-sm border border-gray-200 rounded px-2 py-1 text-center"
                                value={item.quantity}
                                disabled={!item.productId}
                                onChange={e => updateItem(idx, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">扣减汇总</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-[50vh] overflow-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">SKU</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">名称</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-center">剩余库存</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-center">扣减数量</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-center">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deductionSummary.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-400">
                              暂无扣减项
                            </td>
                          </tr>
                        ) : (
                          deductionSummary.map(d => {
                            const sufficient = d.totalQty <= d.product.remaining_count;
                            return (
                              <tr key={d.product.id} className="border-b border-gray-100">
                                <td className="px-3 py-2 text-sm text-gray-800">{d.product.sku}</td>
                                <td className="px-3 py-2 text-sm text-gray-600">{d.product.name}</td>
                                <td className="px-3 py-2 text-sm text-center">{d.product.remaining_count}</td>
                                <td className="px-3 py-2 text-sm text-center font-medium">{d.totalQty}</td>
                                <td className="px-3 py-2 text-center">
                                  {sufficient ? (
                                    <CheckCircle className="w-4 h-4 text-green-500 inline" />
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                                      <AlertTriangle className="w-3 h-3" />
                                      不足
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!loading && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Minus className="w-4 h-4" />
              <span>共需扣减 <strong className="text-gray-800">{totalDeduction}</strong> 件</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                disabled={submitting}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || totalDeduction === 0 || hasInsufficient}
                className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                确认扣减库存
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
