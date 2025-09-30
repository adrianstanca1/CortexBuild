import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'block text-sm font-medium text-muted-foreground';
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <label className={combinedClasses} {...props}>
      {children}
    </label>
  );
};
