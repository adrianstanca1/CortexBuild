import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-card text-card-foreground rounded-[--radius] border border-border p-6 shadow-sm transition-all duration-300 ${className}`} {...props}>
      {children}
    </div>
  );
};