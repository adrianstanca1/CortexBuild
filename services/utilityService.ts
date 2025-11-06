// CortexBuild Comprehensive Utility Service
import { User, Project, Task } from '../types';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeHeaders: boolean;
  dateRange?: { start: string; end: string };
  filters?: { [key: string]: any };
}

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'date' | 'number' | 'custom';
  message: string;
  customValidator?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
}

export interface FileUploadResult {
  success: boolean;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class UtilityService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Data Export Functions
  async exportData<T>(data: T[], options: ExportOptions): Promise<{
    downloadUrl: string;
    fileName: string;
    fileSize: number;
  }> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `export_${timestamp}.${options.format}`;

    // Simulate export processing
    await this.delay(1000);

    return {
      downloadUrl: `/api/exports/${fileName}`,
      fileName,
      fileSize: Math.floor(Math.random() * 1000000) + 100000 // 100KB - 1MB
    };
  }

  async exportToCSV<T extends Record<string, any>>(data: T[], filename?: string): Promise<string> {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // In a real implementation, this would trigger a download
    console.log('CSV Export:', csvContent);
    return csvContent;
  }

  // Data Import Functions
  async importData(file: File, mapping: { [csvColumn: string]: string }): Promise<ImportResult> {
    // Simulate file processing
    await this.delay(2000);

    const recordsProcessed = Math.floor(Math.random() * 1000) + 100;
    const errorRate = Math.random() * 0.1; // 0-10% error rate
    const recordsImported = Math.floor(recordsProcessed * (1 - errorRate));

    return {
      success: true,
      recordsProcessed,
      recordsImported,
      errors: errorRate > 0.05 ? ['Some records had invalid data'] : [],
      warnings: ['Duplicate entries were skipped']
    };
  }

  // Data Validation Functions
  validateData<T>(data: T, rules: ValidationRule[]): ValidationResult {
    const errors: { field: string; message: string }[] = [];

    for (const rule of rules) {
      const value = this.getNestedValue(data, rule.field);

      switch (rule.type) {
        case 'required':
          if (value === null || value === undefined || value === '') {
            errors.push({ field: rule.field, message: rule.message });
          }
          break;

        case 'email':
          if (value && !this.isValidEmail(value)) {
            errors.push({ field: rule.field, message: rule.message });
          }
          break;

        case 'phone':
          if (value && !this.isValidPhone(value)) {
            errors.push({ field: rule.field, message: rule.message });
          }
          break;

        case 'date':
          if (value && !this.isValidDate(value)) {
            errors.push({ field: rule.field, message: rule.message });
          }
          break;

        case 'number':
          if (value && isNaN(Number(value))) {
            errors.push({ field: rule.field, message: rule.message });
          }
          break;

        case 'custom':
          if (rule.customValidator && !rule.customValidator(value)) {
            errors.push({ field: rule.field, message: rule.message });
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // File Upload Functions
  async uploadFile(file: File, category: string = 'general'): Promise<FileUploadResult> {
    // Simulate file upload
    await this.delay(1000);

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      downloadUrl: `/api/files/${fileId}/download`
    };
  }

  async uploadMultipleFiles(files: File[], category: string = 'general'): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, category);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          fileId: '',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          downloadUrl: ''
        });
      }
    }

    return results;
  }

  // Search Functions
  async searchData<T>(
    data: T[],
    query: string,
    searchFields: string[],
    page: number = 1,
    pageSize: number = 20
  ): Promise<SearchResult<T>> {
    const normalizedQuery = query.toLowerCase();

    const filteredData = data.filter(item =>
      searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(normalizedQuery);
      })
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredData.slice(startIndex, endIndex);

    return {
      items,
      totalCount: filteredData.length,
      page,
      pageSize,
      hasMore: endIndex < filteredData.length
    };
  }

  // Caching Functions
  setCache<T>(key: string, data: T, customDuration?: number): void {
    const duration = customDuration || this.CACHE_DURATION;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration
    };
    this.cache.set(key, entry);
  }

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Date and Time Utilities
  formatDate(date: string | Date, format: 'short' | 'long' | 'iso' = 'short'): string {
    const d = new Date(date);

    switch (format) {
      case 'short':
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      case 'long':
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        });
      case 'iso':
        return d.toISOString();
      default:
        return d.toLocaleDateString();
    }
  }

  formatTime(date: string | Date, includeSeconds: boolean = false): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined
    });
  }

  getRelativeTime(date: string | Date): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return this.formatDate(date);
  }

  // Number and Currency Utilities
  formatCurrency(amount: number, currency: string = 'GBP'): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatNumber(number: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  }

  formatPercentage(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  // String Utilities
  truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  capitalizeWords(text: string): string {
    return text.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  }

  // Color Utilities
  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'planning': 'bg-purple-100 text-purple-800'
    };

    return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  getPriorityColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'critical': 'text-red-600',
      'urgent': 'text-red-600'
    };

    return colorMap[priority.toLowerCase()] || 'text-gray-600';
  }

  // Private helper methods
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  }

  private isValidDate(date: string): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Browser Utilities
  downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text)
        .then(() => true)
        .catch(() => false);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(success);
    }
  }

  // Local Storage Utilities
  setLocalStorage(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  getLocalStorage<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  }

  removeLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
}

export const utilityService = new UtilityService();
export default utilityService;
