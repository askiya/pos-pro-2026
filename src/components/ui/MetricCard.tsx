"use client";

import React from 'react';
import { motion } from "framer-motion";

export interface MetricCardProps {
  title: string;
  value: string | React.ReactNode;
  icon: string;
  trend?: {
    value: string;
    icon?: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    isNegative?: boolean;
  };
  subtitle?: string | React.ReactNode;
  isAlert?: boolean;
}

export default function MetricCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  isAlert = false,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="app-surface rounded-xl p-4 md:p-5 flex flex-col gap-4 relative group"
    >
      {/* Background Enhancements */}
      {isAlert ? (
        <div className="absolute inset-0 bg-error-container/12 pointer-events-none opacity-0 group-hover:opacity-100 transition-all"></div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-tertiary-fixed/5 pointer-events-none"></div>
      )}
      <div className="pointer-events-none absolute right-[-18px] top-[-18px] h-28 w-28 rounded-full bg-gradient-to-br from-secondary/18 to-transparent blur-2xl opacity-80" />

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <p className="font-body text-xs text-on-surface-variant font-medium">{title}</p>
        <span 
          className={`material-symbols-outlined text-[18px] p-2 rounded-xl shadow-[0_16px_38px_-28px_rgba(39, 23, 68,0.4)] ${
            isAlert 
              ? 'text-error bg-error-container' 
              : 'text-secondary bg-white/85'
          }`}
        >
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="z-10">
        <h3 className="font-headline text-2xl font-bold text-on-surface tracking-tight">{value}</h3>
        
        {/* Trend / Subtitle section */}
        {(trend || subtitle) && (
          <div 
            className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${
              isAlert ? 'text-error' : 
              trend?.isPositive ? 'text-tertiary-container' : 
              trend?.isNegative ? 'text-error' : 
              'text-on-surface-variant'
            }`}
          >
            {trend?.icon && (
              <span className="material-symbols-outlined text-[14px]">
                {trend.icon}
              </span>
            )}
            {trend && <span>{trend.value}</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
