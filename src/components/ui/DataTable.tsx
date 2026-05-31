'use client';

import React from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  title: React.ReactNode;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  setPage: (p: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  rowKey?: keyof T | ((row: T) => string);
  emptyText?: string;
  checkbox?: boolean;
  pagination?: PaginationProps;
  error?: string | null;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  rowKey = 'id' as keyof T,
  emptyText = '暂无数据',
  checkbox = true,
  pagination,
  error,
}: DataTableProps<T>) {
  const colSpan = columns.length + (checkbox ? 1 : 0);
  const getKey = (row: T, i: number) =>
    typeof rowKey === 'function' ? rowKey(row) : String((row as Record<string, unknown>)[rowKey as string] ?? i);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
          <tr>
            {checkbox && <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded border-gray-300" /></th>}
            {columns.map(col => (
              <th key={col.key} className={`px-4 py-3 whitespace-nowrap ${col.className || ''}`}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={colSpan} className="px-4 py-16 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" /><div className="text-gray-400 text-sm">加载中...</div></td></tr>
          ) : error ? (
            <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-red-500 text-sm">{error}</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-gray-400">{emptyText}</td></tr>
          ) : data.map((row, i) => (
            <tr key={getKey(row, i)} className="border-b border-gray-100 hover:bg-gray-50">
              {checkbox && <td className="px-4 py-3 text-left"><input type="checkbox" className="rounded border-gray-300" /></td>}
              {columns.map(col => (
                <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination footer */}
      {pagination && !loading && !error && pagination.total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
          <span>
            第 {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} 条 / 共 {pagination.total} 条
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => pagination.setPage(1)} disabled={pagination.page <= 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" title="首页">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={() => pagination.setPage(pagination.page - 1)} disabled={pagination.page <= 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" title="上一页">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-gray-700">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => pagination.setPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" title="下一页">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => pagination.setPage(pagination.totalPages)} disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" title="末页">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fallback: simple count when no pagination */}
      {!pagination && !loading && !error && data.length > 0 && (
        <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs italic">共{data.length}条记录</span></div>
      )}
    </div>
  );
}
