/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom/vitest" />

// Global type declarations for ASAgents Ultimate

// Environment variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_ANALYTICS_WRITE_KEY: string;
  readonly VITE_SENTRY_DSN: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Window extensions
interface Window {
  Sentry?: {
    captureException(error: Error): void;
    captureMessage(message: string): void;
    setContext(name: string, context: Record<string, unknown>): void;
    setUser(user: { id: string; email?: string; username?: string } | null): void;
  };
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

// Module declarations for external packages
declare module '*.svg' {
  import React from 'react';
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Common utility types
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Maybe<T> = T | null | undefined;

type AsyncFunction<T = void> = (...args: unknown[]) => Promise<T>;
type VoidFunction = () => void;

// Date utility types
type DateString = string; // ISO 8601 format
type Timestamp = number;

// API related types
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Common component props
interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Form types
type FormValues = Record<string, unknown>;
type FormErrors = Record<string, string | undefined>;

// Generic callback types
type Callback = () => void;
type AsyncCallback = () => Promise<void>;
type EventCallback<T = Event> = (event: T) => void;
type AsyncEventCallback<T = Event> = (event: T) => Promise<void>;

// File upload types
interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

// Toast/Notification types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  timestamp: string;
}

// Loading state types
interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  retryCount?: number;
}

// Generic CRUD operations
interface CRUDOperations<T> {
  create: (data: Partial<T>) => Promise<T>;
  read: (id: string) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: (params?: Record<string, unknown>) => Promise<T[]>;
}

// WebSocket message types
interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
}

// Auth context types extension
interface AuthContextValue {
  user: unknown | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: unknown) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: unknown) => Promise<void>;
  updateUser: (data: unknown) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Common UI prop types
interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

interface InputProps extends BaseComponentProps {
  type?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

// Export all types
export type {
  Nullable,
  Optional,
  Maybe,
  AsyncFunction,
  VoidFunction,
  DateString,
  Timestamp,
  ApiResponse,
  ApiError,
  PaginatedResponse,
  BaseComponentProps,
  FormValues,
  FormErrors,
  Callback,
  AsyncCallback,
  EventCallback,
  AsyncEventCallback,
  FileUploadProgress,
  UploadedFile,
  ToastType,
  Toast,
  LoadingState,
  CRUDOperations,
  WebSocketMessage,
  AuthContextValue,
  ButtonProps,
  InputProps,
};

// External module declarations
declare module '@sentry/browser' {
  export const init: (options: any) => void;
  export const captureException: (error: any) => void;
  export const captureMessage: (message: string) => void;
}

declare module '@sentry/tracing' {
  export class BrowserTracing {
    constructor(options?: any);
  }
}

declare module '@google/genai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string }): any;
  }
}

// JSX intrinsic elements
declare namespace JSX {
  interface IntrinsicElements {
    style: React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement> & {
      jsx?: boolean;
    };
  }
}
