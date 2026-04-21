import React from 'react';

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
    <div className="bg-surface-container-lowest p-5 rounded-xl flex flex-col gap-3 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-outline-variant/10">
      {/* Background Enhancements */}
      {isAlert ? (
        <div className="absolute inset-0 bg-error-container/20 pointer-events-none hidden group-hover:block transition-all"></div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none"></div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <p className="font-body text-sm text-on-surface-variant font-medium">{title}</p>
        <span 
          className={`material-symbols-outlined text-[20px] p-1.5 rounded-lg ${
            isAlert 
              ? 'text-error bg-error-container' 
              : 'text-secondary bg-secondary/10'
          }`}
        >
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="z-10">
        <h3 className="font-headline text-2xl font-bold text-on-surface">{value}</h3>
        
        {/* Trend / Subtitle section */}
        {(trend || subtitle) && (
          <div 
            className={`flex items-center gap-1 mt-1 text-xs font-medium ${
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
    </div>
  );
}
