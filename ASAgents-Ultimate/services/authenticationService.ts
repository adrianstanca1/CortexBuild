// Unified Authentication Service
// Integrates Auth0, Supabase, and JWT token management

import { Auth0Client, createAuth0Client } from '@auth0/auth0-spa-js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import environment from '../config/environment';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  company?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  error: string | null;
}

class AuthenticationService {
  private auth0Client: Auth0Client | null = null;
  private supabaseClient: SupabaseClient | null = null;
  private state: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    tokens: null,
    error: null,
  };
  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    this.initialize();
  }

  // Initialize auth providers
  private async initialize(): Promise<void> {
    try {
      // Initialize Auth0 if configured
      if (environment.auth0Domain && environment.auth0ClientId) {
        this.auth0Client = await createAuth0Client({
          domain: environment.auth0Domain,
          clientId: environment.auth0ClientId,
          authorizationParams: {
            redirect_uri: window.location.origin,
            audience: environment.apiBaseUrl,
            scope: 'openid profile email',
          },
          cacheLocation: 'localstorage',
          useRefreshTokens: true,
        });

        // Check if user is already authenticated
        const isAuthenticated = await this.auth0Client.isAuthenticated();
        if (isAuthenticated) {
          await this.loadAuth0User();
        }
      }

      // Initialize Supabase if configured
      if (environment.supabaseUrl && environment.supabaseAnonKey) {
        this.supabaseClient = createClient(
          environment.supabaseUrl,
          environment.supabaseAnonKey
        );

        // Check for existing session
        const { data: { session } } = await this.supabaseClient.auth.getSession();
        if (session) {
          await this.loadSupabaseUser();
        }
      }

      this.updateState({ isLoading: false });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.updateState({ 
        isLoading: false, 
        error: 'Failed to initialize authentication' 
      });
    }
  }

  // Login with email/password
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Try Auth0 login
      if (this.auth0Client) {
        await this.auth0Client.loginWithRedirect({
          authorizationParams: {
            login_hint: credentials.email,
          },
        });
        // Redirect happens, so this won't return
        throw new Error('Redirecting to Auth0...');
      }

      // Try Supabase login
      if (this.supabaseClient) {
        const { data, error } = await this.supabaseClient.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) throw error;

        if (data.user) {
          const user = await this.loadSupabaseUser();
          this.updateState({ isLoading: false, isAuthenticated: true });
          return user;
        }
      }

      throw new Error('No authentication provider configured');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      this.updateState({ isLoading: false, error: message });
      throw error;
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthUser> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Use Supabase for registration
      if (this.supabaseClient) {
        const { data: authData, error } = await this.supabaseClient.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              company: data.company,
            },
          },
        });

        if (error) throw error;

        if (authData.user) {
          const user = await this.loadSupabaseUser();
          this.updateState({ isLoading: false, isAuthenticated: true });
          return user;
        }
      }

      throw new Error('Registration not available');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      this.updateState({ isLoading: false, error: message });
      throw error;
    }
  }

  // Social login (Google, GitHub, etc.)
  async loginWithProvider(provider: 'google' | 'github' | 'microsoft'): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Try Auth0 social login
      if (this.auth0Client) {
        await this.auth0Client.loginWithRedirect({
          authorizationParams: {
            connection: provider,
          },
        });
        return;
      }

      // Try Supabase social login
      if (this.supabaseClient) {
        const { error } = await this.supabaseClient.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) throw error;
        return;
      }

      throw new Error('Social login not available');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Social login failed';
      this.updateState({ isLoading: false, error: message });
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      if (this.auth0Client) {
        await this.auth0Client.logout({
          logoutParams: {
            returnTo: window.location.origin,
          },
        });
      }

      if (this.supabaseClient) {
        await this.supabaseClient.auth.signOut();
      }

      this.updateState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: null,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      this.updateState({ isLoading: false, error: message });
      throw error;
    }
  }

  // Get current user
  getUser(): AuthUser | null {
    return this.state.user;
  }

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      if (this.auth0Client) {
        return await this.auth0Client.getTokenSilently();
      }

      if (this.supabaseClient) {
        const { data: { session } } = await this.supabaseClient.auth.getSession();
        return session?.access_token || null;
      }

      return null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  // Refresh tokens
  async refreshTokens(): Promise<AuthTokens | null> {
    try {
      if (this.auth0Client) {
        const token = await this.auth0Client.getTokenSilently({
          cacheMode: 'off',
        });

        const tokens: AuthTokens = {
          accessToken: token,
          refreshToken: '', // Auth0 handles refresh internally
          expiresAt: Date.now() + 3600000, // 1 hour
        };

        this.updateState({ tokens });
        return tokens;
      }

      if (this.supabaseClient) {
        const { data, error } = await this.supabaseClient.auth.refreshSession();
        
        if (error) throw error;

        if (data.session) {
          const tokens: AuthTokens = {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: new Date(data.session.expires_at || 0).getTime(),
          };

          this.updateState({ tokens });
          return tokens;
        }
      }

      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      if (this.supabaseClient) {
        const { error } = await this.supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
      } else {
        throw new Error('Password reset not available');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      throw new Error(message);
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<void> {
    try {
      if (this.supabaseClient) {
        const { error } = await this.supabaseClient.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;
      } else {
        throw new Error('Password update not available');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password update failed';
      throw new Error(message);
    }
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    return this.state.user?.permissions.includes(permission) || false;
  }

  // Check if user has role
  hasRole(role: string): boolean {
    return this.state.user?.role === role;
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state); // Call immediately with current state

    return () => {
      this.listeners.delete(listener);
    };
  }

  // Get current auth state
  getState(): AuthState {
    return { ...this.state };
  }

  // Load Auth0 user
  private async loadAuth0User(): Promise<AuthUser> {
    if (!this.auth0Client) {
      throw new Error('Auth0 not initialized');
    }

    const auth0User = await this.auth0Client.getUser();
    const token = await this.auth0Client.getTokenSilently();

    const user: AuthUser = {
      id: auth0User?.sub || '',
      email: auth0User?.email || '',
      name: auth0User?.name,
      avatar: auth0User?.picture,
      role: (auth0User?.['role'] as any) || 'user',
      permissions: (auth0User?.['permissions'] as any) || [],
      metadata: auth0User,
    };

    const tokens: AuthTokens = {
      accessToken: token,
      refreshToken: '',
      expiresAt: Date.now() + 3600000,
    };

    this.updateState({ 
      user, 
      tokens, 
      isAuthenticated: true,
      isLoading: false 
    });

    return user;
  }

  // Load Supabase user
  private async loadSupabaseUser(): Promise<AuthUser> {
    if (!this.supabaseClient) {
      throw new Error('Supabase not initialized');
    }

    const { data: { user: supabaseUser } } = await this.supabaseClient.auth.getUser();
    const { data: { session } } = await this.supabaseClient.auth.getSession();

    if (!supabaseUser || !session) {
      throw new Error('No user session found');
    }

    const user: AuthUser = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name,
      avatar: supabaseUser.user_metadata?.avatar_url,
      role: supabaseUser.user_metadata?.role || 'user',
      permissions: supabaseUser.user_metadata?.permissions || [],
      metadata: supabaseUser.user_metadata,
    };

    const tokens: AuthTokens = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: new Date(session.expires_at || 0).getTime(),
    };

    this.updateState({ 
      user, 
      tokens, 
      isAuthenticated: true,
      isLoading: false 
    });

    return user;
  }

  // Update auth state and notify listeners
  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Export singleton instance
export const authService = new AuthenticationService();
export default authService;
