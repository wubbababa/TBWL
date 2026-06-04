'use client';

import React, { memo, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  pagination?: PaginationProps;
  error?: string | null;
}

/** Pre-computed skeleton widths to avoid layout shift on re-render */
const SKELETON_WIDTHS = [65, 80, 55, 72, 60, 88, 50, 75, 68, 82];

/** Skeleton rows shown during loading */
const SkeletonRows = memo(({ cols, rows = 5 }: { cols: number; rows?: number }) => (
  <>
    {Array.from({ length: rows }, (_, i) => (
      <tr key={i} className="border-b border-gray-100" aria-hidden="true">
        {Array.from({ length: cols }, (_, j) => (
          <td key={j} className="px-4 py-3">
            <div
              className="h-4 bg-gray-100 rounded animate-pulse"
              style={{ width: `${SKELETON_WIDTHS[(i * cols + j) % SKELETON_WIDTHS.length]}%` }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
));
SkeletonRows.displayName = 'SkeletonRows';

export function DataTable<T>({
  columns,
  data,
  loading,
  rowKey = 'id' as keyof T,
  emptyText = '暂无数据',
  checkbox = false,
  selectedIds,
  onSelectionChange,
  pagination,
  error,
}: DataTableProps<T>) {
  const colSpan = columns.length + (checkbox ? 1 : 0);
  const getKey = (row: T, i: number) =>
    typeof rowKey === 'function' ? rowKey(row) : String((row as Record<string, unknown>)[rowKey as string] ?? i);

  const isControlled = selectedIds !== undefined && onSelectionChange !== undefined;

  const getRowId = (row: T, i: number) => getKey(row, i);

  const toggleRow = (row: T, i: number) => {
    if (!isControlled || !onSelectionChange) return;
    const id = getRowId(row, i);
    const next = selectedIds!.includes(id)
      ? selectedIds!.filter(x => x !== id)
      : [...selectedIds!, id];
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (!isControlled || !onSelectionChange) return;
    const pageIds = data.map((row, i) => getRowId(row, i));
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds!.includes(id));
    if (allSelected) {
      onSelectionChange(selectedIds!.filter(id => !pageIds.includes(id)));
    } else {
      const newIds = [...selectedIds!];
      for (const id of pageIds) {
        if (!newIds.includes(id)) newIds.push(id);
      }
      onSelectionChange(newIds);
    }
  };

  const pageIds = data.map((row, i) => getRowId(row, i));
  const allSelected = isControlled && pageIds.length > 0 && pageIds.every(id => selectedIds!.includes(id));
  const someSelected = isControlled && pageIds.some(id => selectedIds!.includes(id)) && !allSelected;

  // Memoize pagination info text
  const paginationInfo = useMemo(() => {
    if (!pagination || pagination.total <= 0) return '';
    const start = (pagination.page - 1) * pagination.pageSize + 1;
    const end = Math.min(pagination.page * pagination.pageSize, pagination.total);
    return `第 ${start}–${end} 条 / 共 ${pagination.total} 条`;
  }, [pagination]);

  return (
    <div className="overflow-x-auto" role="region" aria-label="数据表格">
      <table className="w-full text-sm" role="table">
        <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
          <tr>
            {checkbox && (
              <th className="px-4 py-3 text-left" scope="col">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  aria-label="全选"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={isControlled ? toggleAll : undefined}
                />
              </th>
            )}
            {columns.map(col => (
              <th key={col.key} scope="col" className={`px-4 py-3 whitespace-nowrap ${col.className || ''}`}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows cols={colSpan} />
          ) : error ? (
            <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-red-500 text-sm" role="alert">{error}</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-gray-400">{emptyText}</td></tr>
          ) : data.map((row, i) => (
            <tr key={getKey(row, i)} className="border-b border-gray-100 hover:bg-gray-50">
              {checkbox && (
                <td className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    aria-label={`选择第 ${i + 1} 行`}
                    checked={isControlled ? selectedIds!.includes(getRowId(row, i)) : undefined}
                    onChange={isControlled ? () => toggleRow(row, i) : undefined}
                  />
                </td>
              )}
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
        <nav className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600" aria-label="分页导航">
          <span aria-live="polite">{paginationInfo}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => pagination.setPage(1)} disabled={pagination.page <= 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="首页">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={() => pagination.setPage(pagination.page - 1)} disabled={pagination.page <= 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="上一页">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-gray-700" aria-current="page">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => pagination.setPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="下一页">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => pagination.setPage(pagination.totalPages)} disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="末页">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}

      {/* Fallback: simple count when no pagination */}
      {!pagination && !loading && !error && data.length > 0 && (
        <div className="p-4 flex justify-end"><span className="text-gray-400 text-xs italic">共{data.length}条记录</span></div>
      )}
    </div>
  );
}
