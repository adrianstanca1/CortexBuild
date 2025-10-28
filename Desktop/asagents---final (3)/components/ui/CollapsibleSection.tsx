import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = false, badge }) => {
  return (
    <details open={defaultOpen} className="border-b last:border-b-0 py-2">
      <summary className="cursor-pointer font-semibold text-card-foreground flex justify-between items-center list-none -my-2 py-2">
        <div className="flex items-center gap-2">
            <span>{title}</span>
            {badge}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 transform detail-arrow text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </summary>
      <div className="pt-4 pb-2 text-sm text-muted-foreground">
        {children}
      </div>
      <style>{`
        details[open] > summary .detail-arrow {
          transform: rotate(90deg);
        }
      `}</style>
    </details>
  );
};
