import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  checked = false,
  onCheckedChange,
  className = '',
  ...props 
}) => {
  const baseClasses = 'h-4 w-4 rounded border border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2';
  const combinedClasses = `${baseClasses} ${className}`.trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      className={combinedClasses}
      {...props}
    />
  );
};
