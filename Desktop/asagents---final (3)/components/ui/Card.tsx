import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`relative bg-card rounded-xl shadow-md p-6 border border-border transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};