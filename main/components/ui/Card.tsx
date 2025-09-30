import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200/80 transition-all duration-300 ${className}`} {...props}>
      {children}
    </div>
  );
};
