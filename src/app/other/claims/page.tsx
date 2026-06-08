'use client';

import React, { useState, useCallback } from 'react';
import { ShieldAlert, Search, Plus, Filter, CheckCircle2, Clock, XCircle, MoreVertical, RefreshCw, Eye, Trash2 } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';
import { CreateClaimModal } from '@/components/other/CreateClaimModal';
import { DetailModal } from '@/components/ui/DetailModal';
import { supabase } from '@/lib/supabase';

interface Claim {
  id: string;
  order_number: string;
  tracking_number: string | null;
  reason: string;
  claim_amount: number | null;
  status: string;
  created_at: string;
}

const statusStyle = (s: string) => {
  if (s === '处理中') return 'text-blue-600 bg-blue-50 border-blue-100';
  if (s === '已结案') return 'text-green-600 bg-green-50 border-green-100';
  if (s === '已拒绝') return 'text-red-600 bg-red-50 border-red-100';
  return 'text-gray-600 bg-gray-50 border-gray-100';
};

const StatusIcon = ({ s }: { s: string }) => {
  if (s === '处理中') return <Clock className="w-3.5 h-3.5" />;
  if (s === '已结案') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (s === '已拒绝') return <XCircle className="w-3.5 h-3.5" />;
  return null;
};

export default function ClaimsPage() {
  const [searchText, setSearchText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailRow, setDetailRow] = useState<Claim | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (searchText) {
      q = q.or(`order_number.ilike.%${searchText}%,tracking_number.ilike.%${searchText}%`);
    }
    return q;
  }, [searchText]);

  const { data: claims, loading, total, refresh } = useTableQuery<Claim>({
    table: 'claims',
    filterFn,
  });

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此索赔记录？')) return;
    const { error } = await supabase.from('claims').delete().eq('id', id);
    if (error) { console.error('删除失败:', error); return; }
    setMenuOpenId(null);
    refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">索赔登记管理</h1>
            <p className="text-sm text-gray-500">跟踪与处理运输损毁、丢失等索赔申请</p>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100">
          <Plus className="w-4 h-4" />发起新索赔
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索索赔单号、订单号或物流单号..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && refresh()}
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all text-sm"
            />
          </div>
          <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />筛选条件
          </button>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={refresh}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">索赔单号 / 日期</th>
                <th className="px-6 py-4">关联单号</th>
                <th className="px-6 py-4">原因</th>
                <th className="px-6 py-4 text-right">索赔金额</th>
                <th className="px-6 py-4">当前进度</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : claims.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">暂无索赔记录</td></tr>
              ) : claims.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 font-mono text-xs">{c.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1 rounded uppercase">ORD</span>
                        <span className="text-sm font-medium text-gray-600">{c.order_number}</span>
                      </div>
                      {c.tracking_number && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1 rounded uppercase">TRK</span>
                          <span className="text-xs font-mono text-gray-500">{c.tracking_number}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600 max-w-[200px] truncate">{c.reason}</td>
                  <td className="px-6 py-5 text-right font-bold text-gray-900">
                    {c.claim_amount != null ? `¥${c.claim_amount.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle(c.status)}`}>
                      <StatusIcon s={c.status} />{c.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="relative inline-block">
                      <button onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {menuOpenId === c.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button onClick={() => { setDetailRow(c); setMenuOpenId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                            <Eye className="w-4 h-4" />详情
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                            <Trash2 className="w-4 h-4" />删除
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">共 {total} 条索赔记录</p>
        </div>
      </div>

      {showCreateModal && (
        <CreateClaimModal onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); refresh(); }} />
      )}

      {detailRow && (
        <DetailModal
          title="索赔详情"
          onClose={() => setDetailRow(null)}
          fields={[
            { label: '索赔单号', value: detailRow.id.slice(0, 8).toUpperCase() },
            { label: '订单编号', value: detailRow.order_number },
            { label: '物流单号', value: detailRow.tracking_number || '-' },
            { label: '索赔原因', value: detailRow.reason },
            { label: '索赔金额', value: detailRow.claim_amount != null ? `¥${detailRow.claim_amount.toFixed(2)}` : '-' },
            { label: '状态', value: detailRow.status },
            { label: '创建时间', value: new Date(detailRow.created_at).toLocaleString('zh-CN') },
          ]}
        />
      )}
    </div>
  );
}
