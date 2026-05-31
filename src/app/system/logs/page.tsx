'use client';

import { useState, useCallback } from 'react';
import { Monitor, Search, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTableQuery } from '@/lib/useTableQuery';

interface LogEntry {
  id: string;
  user_email: string;
  action: string;
  module: string;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
}

export default function OperationLogsPage() {
  const [keyword, setKeyword] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const filterFn = useCallback((query: Parameters<typeof Array.isArray>[0]) => {
    let q = query;
    if (keyword) {
      q = q.or(`action.ilike.%${keyword}%,user_email.ilike.%${keyword}%,detail.ilike.%${keyword}%`);
    }
    if (moduleFilter) {
      q = q.eq('module', moduleFilter);
    }
    return q;
  }, [keyword, moduleFilter]);

  const { data: logs, loading, total, page, totalPages, setPage, refresh } = useTableQuery<LogEntry>({
    table: 'operation_logs',
    pageSize: 50,
    filterFn,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Monitor className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">操作日志</h1>
          <p className="text-sm text-gray-500">查看所有管理员的操作记录</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索操作人/操作内容..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
          />
        </div>
        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
        >
          <option value="">全部模块</option>
          <option value="订单">订单</option>
          <option value="库存">库存</option>
          <option value="资金">资金</option>
          <option value="系统">系统</option>
          <option value="账号">账号</option>
        </select>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#3c8dbc] hover:bg-[#367fa9] text-white text-sm font-medium rounded-md transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          查询
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">时间</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">操作人</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">模块</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">操作</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">详情</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mx-auto mb-2" />加载中...
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">暂无操作日志记录</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{log.user_email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">{log.module}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{log.action}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{log.detail || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{log.ip_address || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
            <span>共 {total} 条记录 · 第 {page}/{totalPages} 页</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page <= 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-2 font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
              <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
