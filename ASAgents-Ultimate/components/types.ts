// Component-specific types
export interface ComponentBaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export type Size = 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
