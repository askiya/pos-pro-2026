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
        className="app-field w-full pl-11 pr-4 py-3.5 text-sm font-body"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
      />
    </div>
  );
}
