// Enhanced Authentication Service for Dual Backend Architecture
import { dualBackendService, type EnhancedAuthResponse } from './dualBackendService';
import type { User, LoginCredentials } from '../types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  backendCapabilities: {
    aiFeatures: boolean;
    enterpriseFeatures: boolean;
    multiBackend: boolean;
  };
  permissions: Record<string, boolean>;
  roles: string[];
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  getBackendStatus: () => { nodejs: boolean; java: boolean; overall: boolean };
}

class EnhancedAuthService {
  private authState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    backendCapabilities: {
      aiFeatures: false,
      enterpriseFeatures: false,
      multiBackend: false
    },
    permissions: {},
    roles: []
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication from stored data
   */
  private async initializeAuth(): Promise<void> {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    const storedCapabilities = localStorage.getItem('auth_capabilities');
    const storedPermissions = localStorage.getItem('auth_permissions');
    const storedRoles = localStorage.getItem('auth_roles');

    if (storedToken && storedUser) {
      try {
        this.updateAuthState({
          token: storedToken,
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          backendCapabilities: storedCapabilities 
            ? JSON.parse(storedCapabilities) 
            : this.authState.backendCapabilities,
          permissions: storedPermissions ? JSON.parse(storedPermissions) : {},
          roles: storedRoles ? JSON.parse(storedRoles) : []
        });

        // Verify token validity with backends
        await this.refreshAuth();
      } catch (error) {
        console.error('Failed to initialize auth from storage:', error);
        this.logout();
      }
    }
  }

  /**
   * Enhanced login using dual backend system
   */
  async login(credentials: LoginCredentials): Promise<boolean> {
    this.updateAuthState({ isLoading: true, error: null });

    try {
      const authResponse: EnhancedAuthResponse = await dualBackendService.enhancedLogin(credentials);

      if (authResponse.success && authResponse.user && authResponse.token) {
        const backendCapabilities = {
          aiFeatures: !!authResponse.nodeJsAuth,
          enterpriseFeatures: !!authResponse.enterpriseFeatures,
          multiBackend: !!authResponse.multiBackendAuth
        };

        // Store authentication data
        localStorage.setItem('auth_token', authResponse.token);
        localStorage.setItem('auth_user', JSON.stringify(authResponse.user));
        localStorage.setItem('auth_capabilities', JSON.stringify(backendCapabilities));
        localStorage.setItem('auth_permissions', JSON.stringify(authResponse.permissions || {}));
        localStorage.setItem('auth_roles', JSON.stringify(authResponse.roles || []));

        this.updateAuthState({
          user: authResponse.user,
          token: authResponse.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          backendCapabilities,
          permissions: authResponse.permissions || {},
          roles: authResponse.roles || []
        });

        console.log('Enhanced authentication successful:', {
          multiBackend: authResponse.multiBackendAuth,
          aiEnhanced: authResponse.aiEnhanced,
          enterpriseFeatures: authResponse.enterpriseFeatures
        });

        return true;
      } else {
        this.updateAuthState({
          isLoading: false,
          error: authResponse.error || 'Authentication failed'
        });
        return false;
      }

    } catch (error) {
      console.error('Login error:', error);
      this.updateAuthState({
        isLoading: false,
        error: `Login failed: ${error}`
      });
      return false;
    }
  }

  /**
   * Logout from both backends
   */
  logout(): void {
    // Clear stored data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_capabilities');
    localStorage.removeItem('auth_permissions');
    localStorage.removeItem('auth_roles');

    // Reset auth state
    this.updateAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      backendCapabilities: {
        aiFeatures: false,
        enterpriseFeatures: false,
        multiBackend: false
      },
      permissions: {},
      roles: []
    });

    console.log('User logged out from all backends');
  }

  /**
   * Refresh authentication status with both backends
   */
  async refreshAuth(): Promise<void> {
    if (!this.authState.token) {
      return;
    }

    try {
      // Check system health and backend availability
      const healthResponse = await dualBackendService.getSystemHealth();
      
      if (healthResponse.success) {
        const health = healthResponse.data;
        
        // Update backend capabilities based on current health
        const updatedCapabilities = {
          aiFeatures: health.nodejsBackend?.status === 'healthy',
          enterpriseFeatures: health.javaBackend?.status === 'healthy',
          multiBackend: health.javaBackend?.status === 'healthy' && health.nodejsBackend?.status === 'healthy'
        };

        this.updateAuthState({
          backendCapabilities: updatedCapabilities
        });

        console.log('Auth refresh successful - Backend capabilities updated:', updatedCapabilities);
      }

    } catch (error) {
      console.error('Failed to refresh auth:', error);
      // Don't logout on refresh failure - user might still be valid
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    return !!this.authState.permissions[permission];
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.authState.roles.includes(role);
  }

  /**
   * Get current backend status
   */
  getBackendStatus(): { nodejs: boolean; java: boolean; overall: boolean } {
    return dualBackendService.isHealthy;
  }

  /**
   * Check if specific backend features are available
   */
  hasAiFeatures(): boolean {
    return this.authState.backendCapabilities.aiFeatures;
  }

  hasEnterpriseFeatures(): boolean {
    return this.authState.backendCapabilities.enterpriseFeatures;
  }

  isMultiBackendEnabled(): boolean {
    return this.authState.backendCapabilities.multiBackend;
  }

  /**
   * Get current auth state
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Update auth state and notify listeners
   */
  private updateAuthState(updates: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...updates };
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      listener(this.authState);
    });
  }

  /**
   * Get user display info
   */
  getUserDisplayInfo(): { name: string; email: string; avatar?: string } | null {
    if (!this.authState.user) return null;

    return {
      name: `${this.authState.user.firstName || ''} ${this.authState.user.lastName || ''}`.trim() || this.authState.user.email,
      email: this.authState.user.email,
      avatar: this.authState.user.avatarUrl
    };
  }

  /**
   * Check if user can access specific features
   */
  canAccessFeature(feature: 'ai' | 'analytics' | 'reports' | 'admin'): boolean {
    switch (feature) {
      case 'ai':
        return this.hasAiFeatures() && this.isAuthenticated;
      case 'analytics':
        return this.hasEnterpriseFeatures() && (this.hasPermission('canViewAnalytics') || this.hasRole('ADMIN'));
      case 'reports':
        return this.hasEnterpriseFeatures() && (this.hasPermission('canExportReports') || this.hasRole('ADMIN'));
      case 'admin':
        return this.hasRole('ADMIN') || this.hasPermission('canManageUsers');
      default:
        return false;
    }
  }

  /**
   * Get feature availability summary
   */
  getFeatureAvailability(): Record<string, { available: boolean; reason?: string }> {
    const backendStatus = this.getBackendStatus();
    
    return {
      aiProcessing: {
        available: backendStatus.nodejs && this.isAuthenticated,
        reason: !backendStatus.nodejs ? 'AI backend unavailable' : !this.isAuthenticated ? 'Not authenticated' : undefined
      },
      enterpriseAnalytics: {
        available: backendStatus.java && this.hasEnterpriseFeatures(),
        reason: !backendStatus.java ? 'Enterprise backend unavailable' : !this.hasEnterpriseFeatures() ? 'No enterprise access' : undefined
      },
      enhancedFeatures: {
        available: this.isMultiBackendEnabled(),
        reason: !this.isMultiBackendEnabled() ? 'Multi-backend not enabled' : undefined
      }
    };
  }

  // Getters for common auth state properties
  get isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  get isLoading(): boolean {
    return this.authState.isLoading;
  }

  get user(): User | null {
    return this.authState.user;
  }

  get error(): string | null {
    return this.authState.error;
  }
}

// Export singleton instance
export const enhancedAuthService = new EnhancedAuthService();
export default enhancedAuthService;