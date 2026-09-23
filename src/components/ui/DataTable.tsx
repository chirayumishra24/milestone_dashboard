'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export type SortDirection = 'asc' | 'desc';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  /** Makes the column sortable */
  sortValue?: (row: T) => number | string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  /** Hide on narrow screens, e.g. 'hidden md:table-cell' */
  responsiveClassName?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string;
  /** Accessible table name, read by screen readers */
  caption: string;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string, direction: SortDirection) => void;
  /** Mouse convenience; also render a real button in a cell for keyboard users */
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: React.ReactNode;
}

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

export default function DataTable<T>({
  rows,
  columns,
  getRowKey,
  caption,
  sortKey,
  sortDirection = 'asc',
  onSortChange,
  onRowClick,
  pageSize = 25,
  emptyMessage = 'No records match your filters.',
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return rows;
    const getValue = column.sortValue;
    return [...rows].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [rows, columns, sortKey, sortDirection]);

  // Back to the first page when the result set or ordering changes. Keyed on content rather
  // than array identity, since callers usually rebuild `rows` on every render.
  const resultSignature = `${rows.length}:${rows.length ? getRowKey(rows[0]) : ''}:${
    rows.length ? getRowKey(rows[rows.length - 1]) : ''
  }`;
  useEffect(() => setPage(0), [resultSignature, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const toggleSort = (key: string) => {
    if (!onSortChange) return;
    onSortChange(key, key === sortKey && sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              {columns.map((col) => {
                const isSorted = col.key === sortKey;
                const ariaSort = isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined;
                const SortIcon = isSorted ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={col.sortValue ? ariaSort ?? 'none' : undefined}
                    className={`py-3 px-3 whitespace-nowrap ${alignClass[col.align ?? 'left']} ${col.responsiveClassName ?? ''}`}
                  >
                    {col.sortValue && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={`inline-flex items-center gap-1 hover:text-blue-700 ${isSorted ? 'text-blue-700' : ''}`}
                      >
                        {col.header}
                        <SortIcon className="w-3 h-3" aria-hidden="true" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'hover:bg-blue-50/40 cursor-pointer transition-colors group' : ''}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2.5 px-3 ${alignClass[col.align ?? 'left']} ${col.className ?? ''} ${col.responsiveClassName ?? ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <nav
          aria-label="Table pages"
          className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-100 text-xs text-slate-600"
        >
          <span>
            {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 0}
              aria-label="Previous page"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="px-2 font-semibold">
              Page {currentPage + 1} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount - 1}
              aria-label="Next page"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
