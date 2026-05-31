'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface Column<T> {
  key: string;
  title: React.ReactNode;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  rowKey?: keyof T | ((row: T) => string);
  emptyText?: string;
  checkbox?: boolean;
}

export function DataTable<T>({ columns, data, loading, rowKey = 'id' as keyof T, emptyText = '暂无数据', checkbox = true }: DataTableProps<T>) {
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
      <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs italic">共{data.length}条记录</span></div>
    </div>
  );
}
