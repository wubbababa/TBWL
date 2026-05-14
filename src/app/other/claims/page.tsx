'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical
} from 'lucide-react';

export default function ClaimsPage() {
  const claims = [
    { id: 'CLM-20260510-01', order: 'ORD-TBWL-20260501-0001', tracking: 'SF1234567890', amount: '150.00', status: '处理中', date: '2026-05-10' },
    { id: 'CLM-20260508-05', order: 'ORD-TBWL-20260428-0102', tracking: 'YT9876543210', amount: '45.50', status: '已结案', date: '2026-05-08' },
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case '处理中': return 'text-blue-600 bg-blue-50 border-blue-100';
      case '已结案': return 'text-green-600 bg-green-50 border-green-100';
      case '已拒绝': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case '处理中': return <Clock className="w-3.5 h-3.5" />;
      case '已结案': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case '已拒绝': return <XCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
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
        <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100">
          <Plus className="w-4 h-4" />
          发起新索赔
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索索赔单号、订单号或物流单号..."
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" />
            筛选条件
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f9fafb] border-y border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">索赔单号 / 日期</th>
                <th className="px-6 py-4">关联单号</th>
                <th className="px-6 py-4 text-right">索赔金额</th>
                <th className="px-6 py-4">当前进度</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{claim.id}</span>
                      <span className="text-xs text-gray-400 mt-1 font-mono">{claim.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1 rounded uppercase">ORD</span>
                        <span className="text-sm font-medium text-gray-600">{claim.order}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1 rounded uppercase">TRK</span>
                        <span className="text-xs font-mono text-gray-500">{claim.tracking}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-gray-900">
                    ¥{claim.amount}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">显示最近 10 条索赔记录</p>
        </div>
      </div>
    </div>
  );
}
