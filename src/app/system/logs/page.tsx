'use client';

import { useState, useEffect } from 'react';
import { Monitor, Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('operation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (keyword) {
        query = query.or(`action.ilike.%${keyword}%,user_email.ilike.%${keyword}%,detail.ilike.%${keyword}%`);
      }
      if (moduleFilter) {
        query = query.eq('module', moduleFilter);
      }

      const { data } = await query;
      setLogs(data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Monitor className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">操作日志</h1>
          <p className="text-sm text-gray-500">查看所有管理员的操作记录</p>
        </div>
      </div>

      {/* Filters */}
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
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#3c8dbc] hover:bg-[#367fa9] text-white text-sm font-medium rounded-md transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          查询
        </button>
      </div>

      {/* Table */}
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
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">加载中...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">暂无操作日志记录</td></tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{log.user_email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                        {log.module}
                      </span>
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
      </div>
    </div>
  );
}
