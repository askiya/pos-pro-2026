"use client";
import React from 'react';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
  autoFocus = false
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
        search
      </span>
      <input 
        type="text" 
        className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg focus:bg-surface-bright focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-body outline-none shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
      />
    </div>
  );
}
