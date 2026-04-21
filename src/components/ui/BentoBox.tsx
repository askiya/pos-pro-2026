import React from 'react';

export interface BentoBoxProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function BentoBox({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false
}: BentoBoxProps) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      {(title || subtitle || action) && (
        <div className={`p-5 flex justify-between items-center bg-surface-container-lowest z-10 ${!noPadding ? 'border-b border-surface-container-low' : ''}`}>
          <div>
            {title && <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>}
            {subtitle && <p className="font-body text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      {/* Content */}
      <div className={`flex-1 ${noPadding ? '' : 'p-5'}`}>
        {children}
      </div>
    </div>
  );
}
