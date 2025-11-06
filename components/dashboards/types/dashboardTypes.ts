/**
 * Dashboard Type Definitions
 * Centralized type definitions for all dashboard components
 */

import { LucideIcon } from 'lucide-react';

// ==================== USER & AUTH ====================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'company_admin' | 'developer' | 'project_manager' | 'field_worker' | 'client' | 'supervisor';
  companyId?: string;
  company_id?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== DASHBOARD COMPONENTS ====================

export interface DashboardStat {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
  bgGradient: string;
}

export interface DashboardSection {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  count?: number;
  description: string;
  action?: () => void;
}

export interface DashboardTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface DashboardProps {
  currentUser?: User;
  navigateTo?: (screen: string, params?: any) => void;
  isDarkMode?: boolean;
  onNavigate?: (section: string) => void;
}

// ==================== CARD COMPONENTS ====================

export interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  onClick?: () => void;
  delay?: number;
}

export interface SectionCardProps {
  section: DashboardSection;
  onClick: (id: string) => void;
  delay?: number;
}

// ==================== HEADER COMPONENTS ====================

export interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
  gradient: string;
}

// ==================== STATS COMPONENTS ====================

export interface QuickStatsProps {
  stats: DashboardStat[];
  columns?: 2 | 3 | 4;
}

// ==================== GRID COMPONENTS ====================

export interface SectionGridProps {
  sections: DashboardSection[];
  onSectionClick: (id: string) => void;
  columns?: 2 | 3 | 4;
}

// ==================== TAB COMPONENTS ====================

export interface DashboardTabsProps {
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// ==================== COLOR SYSTEM ====================

export interface ColorClasses {
  bg: string;
  text: string;
  border: string;
  hover: string;
  gradient: string;
}

export type ColorName = 
  | 'blue' 
  | 'purple' 
  | 'green' 
  | 'orange' 
  | 'red' 
  | 'cyan' 
  | 'pink' 
  | 'yellow' 
  | 'indigo' 
  | 'gray';

// ==================== ANIMATION CONFIG ====================

export interface AnimationConfig {
  fadeInDuration: number;
  staggerDelay: number;
  hoverScale: number;
  transitionDuration: number;
}

// ==================== GRID CONFIG ====================

export interface GridConfig {
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface GridConfigs {
  stats: GridConfig;
  sections: GridConfig;
  cards: GridConfig;
}

