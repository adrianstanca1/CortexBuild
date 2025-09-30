import React, { useState, useRef, useEffect, useMemo } from 'react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => { },
});

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const contextValue = useMemo(() => ({
    value,
    onValueChange,
    isOpen,
    setIsOpen
  }), [value, onValueChange, isOpen, setIsOpen]);

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = ''
}) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  const baseClasses = 'flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <button
      type="button"
      className={`${baseClasses} ${className}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className = ''
}) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const baseClasses = 'absolute top-full left-0 z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto';

  return (
    <div ref={ref} className={`${baseClasses} ${className}`} role="listbox">
      {children}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  className = ''
}) => {
  const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;
  const baseClasses = 'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground';

  const handleClick = () => {
    if (onValueChange) {
      onValueChange(value);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
    >
      {children}
    </button>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder = 'Select...',
  className = ''
}) => {
  const { value } = React.useContext(SelectContext);

  return (
    <span className={className}>
      {value || placeholder}
    </span>
  );
};
