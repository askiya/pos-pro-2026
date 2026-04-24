"use client";
import React from 'react';

export interface ColumnDef {
  header: React.ReactNode;
  className?: string;
}

export interface DataTableProps {
  columns: ColumnDef[];
  children: React.ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange?: (page: number) => void;
  };
  minWidth?: string;
}

export default function DataTable({
  columns,
  children,
  pagination,
  minWidth = "min-w-[800px]"
}: DataTableProps) {
  const hasItems = pagination ? pagination.totalItems > 0 : false;
  const startItem = pagination
    ? hasItems
      ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1
      : 0
    : 0;
  const endItem = pagination
    ? hasItems
      ? Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)
      : 0
    : 0;

  return (
    <div className="app-surface flex-1 rounded-[30px] flex flex-col overflow-hidden relative">
      
      {/* Table Header Row */}
      <div className={`flex w-full gap-4 px-6 py-4 bg-white/92 border-b border-outline-variant/10 sticky top-0 z-20 font-body text-xs font-semibold text-on-surface-variant uppercase tracking-[0.18em] ${minWidth}`}>
        {columns.map((col, idx) => (
          <div key={idx} className={col.className}>
            {col.header}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div className={`flex-1 overflow-y-auto bg-transparent flex flex-col ${minWidth}`}>
        {children}
      </div>

      {/* Table Footer / Pagination */}
      {pagination && (
        <div className={`border-t border-outline-variant/10 px-6 py-4 flex items-center justify-between bg-white/88 text-sm ${minWidth}`}>
          <span className="font-body text-on-surface-variant">
            Showing {startItem} to {endItem} of {pagination.totalItems} entries
          </span>
          <div className="flex gap-1">
            <button 
              className="app-icon-btn h-9 w-9 rounded-xl disabled:opacity-50" 
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange?.(pagination.currentPage - 1)}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            
            {/* Simple pagination numbers for demo */}
            {[...Array(Math.min(3, pagination.totalPages))].map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === pagination.currentPage;
              return (
                <button 
                  key={pageNum}
                  className={`h-9 min-w-[2.25rem] rounded-xl px-3 font-headline font-medium text-xs flex items-center justify-center transition-colors ${
                    isActive ? 'app-primary-btn text-white font-bold' : 'app-secondary-btn text-on-surface-variant'
                  }`}
                  onClick={() => pagination.onPageChange?.(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {pagination.totalPages > 3 && (
              <span className="w-7 h-7 flex items-center justify-center text-on-surface-variant text-xs">...</span>
            )}
            
            <button 
              className="app-icon-btn h-9 w-9 rounded-xl disabled:opacity-50"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange?.(pagination.currentPage + 1)}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
