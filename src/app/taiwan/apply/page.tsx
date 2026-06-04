'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FileUp, Search, RefreshCw, ChevronDown, ChevronUp, Download, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateTemplateCsv, downloadCsv, TAIWAN_APPLY_IMPORT_COLUMNS } from '@/lib/csv';
import { CreateTaiwanApplyModal } from '@/components/taiwan/CreateTaiwanApplyModal';

interface TaiwanApply {
  id: string;
  member_code: string;
  product_count: number;
  manifest_type: string;
  status: string;
  remarks: string | null;
  created_at: string;
}

const statusStyle = (s: string) => {
  if (s === '已发货') return 'bg-green-50 text-green-600 border-green-100';
  if (s === '处理中') return 'bg-blue-50 text-blue-600 border-blue-100';
  if (s === '待处理') return 'bg-yellow-50 text-yellow-600 border-yellow-100';
  if (s === '已取消') return 'bg-gray-50 text-gray-400 border-gray-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

export default function TaiwanApplyPage() {
  const [rows, setRows] = useState<TaiwanApply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [memberFilter, setMemberFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRows = async () => {
    setLoading(true);
    let query = supabase.from('taiwan_apply').select('*');
    if (memberFilter) query = query.ilike('member_code', `%${memberFilter}%`);
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data } = await query.order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRows(); }, []);

  return (
    <div className="flex flex-col gap-4">
      {showCreateModal && (
        <CreateTaiwanApplyModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchRows}
        />
      )}
      <div className="card">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">倉單號查詢</label>
            <input type="text" placeholder="倉單號" value={memberFilter} onChange={e => setMemberFilter(e.target.value)}
              className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">快遞單號</label>
            <input type="text" placeholder="快遞單號" className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">貨件編號</label>
            <input type="text" placeholder="貨件編號" className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">商品SKU</label>
            <input type="text" placeholder="商品SKU/商品名" className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">收貨仓库</label>
            <div className="flex-1 relative">
              <select className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="Taipei">臺北倉</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 min-w-[70px]">貨件狀態</label>
            <div className="flex-1 relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none appearance-none bg-white cursor-pointer">
                <option value="">請选择貨件狀態</option>
                <option value="待处理">待处理</option>
                <option value="处理中">处理中</option>
                <option value="已发货">已发货</option>
                <option value="已取消">已取消</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="lg:col-span-3 flex justify-start items-center gap-2 mt-2">
            <div className="flex-1"></div>
            <button onClick={fetchRows} className="flex items-center gap-1.5 h-8 px-3 bg-[#3c8dbc] text-white text-xs rounded hover:bg-[#367fa9]">
              <Search className="w-3.5 h-3.5" /><span>查询</span>
            </button>
            <button onClick={() => { setMemberFilter(''); setStatusFilter(''); }} className="flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50">
              <RotateCcw className="w-3.5 h-3.5" /><span>重置</span>
            </button>
            <div className="flex items-center gap-3 ml-4">
              <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><ChevronUp className="w-4 h-4" /></button>
              <RefreshCw
                className={`w-4 h-4 text-gray-500 cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
                onClick={fetchRows}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3c8dbc] text-white text-sm rounded hover:bg-[#367fa9]">
          <Plus className="w-4 h-4" /><span>申请仓儲發貨</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
          <FileUp className="w-4 h-4" /><span>EXCEL导入货件</span>
        </button>
        <button
          onClick={() => {
            const csv = generateTemplateCsv(TAIWAN_APPLY_IMPORT_COLUMNS);
            downloadCsv(csv, '台湾申请入库模板.csv');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
        >
          <Download className="w-4 h-4" /><span>模板下载</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f39c12]/20 text-[#dd4b39] border border-[#dd4b39]/30 text-sm rounded hover:bg-[#dd4b39]/10">
          <Trash2 className="w-4 h-4" /><span>批量删除</span>
        </button>
      </div>

      <div className="card flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-[#4b646f] font-bold">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-3 whitespace-nowrap">會員/代理/貨件編號</th>
                <th className="px-4 py-3 whitespace-nowrap">商品數</th>
                <th className="px-4 py-3 whitespace-nowrap">艙單類型</th>
                <th className="px-4 py-3 whitespace-nowrap">貨件狀態</th>
                <th className="px-4 py-3 whitespace-nowrap">備註</th>
                <th className="px-4 py-3 whitespace-nowrap">創建時間</th>
                <th className="px-4 py-3 whitespace-nowrap text-right pr-12">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">暂无发货申请记录</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{r.member_code}</td>
                  <td className="px-4 py-3 text-center font-bold">{r.product_count}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-full text-[11px] font-bold">{r.manifest_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.remarks || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3 text-right pr-12"><button className="text-blue-600 hover:underline text-xs font-bold">详情</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex items-center gap-2 text-gray-500 text-sm">共 {rows.length} 條記錄</div>
        </div>
      </div>
    </div>
  );
}
