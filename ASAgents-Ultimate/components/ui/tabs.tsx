import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  children, 
  defaultValue = '', 
  value: controlledValue,
  onValueChange,
  className = '' 
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  // Use controlled value if provided, otherwise use internal state
  const activeTab = controlledValue !== undefined ? controlledValue : internalValue;
  
  const setActiveTab = (value: string) => {
    if (controlledValue === undefined) {
      setInternalValue(value);
    }
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-muted p-1 ${className}`}>
      {children}
    </div>
  );
};

export interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, value, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
        } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ children, value, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
};