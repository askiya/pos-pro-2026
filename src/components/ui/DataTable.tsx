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
  return (
    <div className="flex-1 bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden relative shadow-sm border border-outline-variant/15">
      
      {/* Table Header Row */}
      <div className={`flex w-full gap-4 px-6 py-4 bg-surface-container-lowest border-b border-surface-container-low sticky top-0 z-20 font-body text-xs font-semibold text-on-surface-variant uppercase tracking-wider ${minWidth}`}>
        {columns.map((col, idx) => (
          <div key={idx} className={col.className}>
            {col.header}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div className={`flex-1 overflow-y-auto bg-surface-container-lowest flex flex-col ${minWidth}`}>
        {children}
      </div>

      {/* Table Footer / Pagination */}
      {pagination && (
        <div className={`border-t border-surface-container-low px-6 py-4 flex items-center justify-between bg-surface-container-lowest text-sm ${minWidth}`}>
          <span className="font-body text-on-surface-variant">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} entries
          </span>
          <div className="flex gap-1">
            <button 
              className="p-1 rounded bg-surface text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50" 
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
                  className={`w-7 h-7 rounded font-headline font-medium text-xs flex items-center justify-center transition-colors ${
                    isActive ? 'bg-secondary text-white font-bold' : 'bg-surface text-on-surface-variant hover:bg-surface-container-high'
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
              className="p-1 rounded bg-surface text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
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
