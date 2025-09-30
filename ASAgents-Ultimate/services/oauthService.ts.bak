// OAuth service for handling GitHub and OAuth.io authentication
import { getEnvironment } from '../config/environment';
import type { SocialProvider, User } from '../types';

export interface OAuthConfig {
  google: {
    clientId: string;
    enabled: boolean;
  };
  github: {
    clientId: string;
    enabled: boolean;
  };
  oauthIo: {
    publicKey: string;
    enabled: boolean;
  };
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: SocialProvider;
}

class OAuthService {
  private config: OAuthConfig;

  constructor() {
    const env = getEnvironment();
    this.config = env.oauth;
  }

  /**
   * Get OAuth configuration
   */
  getConfig(): OAuthConfig {
    return this.config;
  }

  /**
   * Check if a provider is enabled
   */
  isProviderEnabled(provider: SocialProvider): boolean {
    switch (provider) {
      case 'google':
        return this.config.google.enabled || this.config.oauthIo.enabled;
      case 'facebook':
        return this.config.oauthIo.enabled;
      default:
        return false;
    }
  }

  /**
   * Initiate Google OAuth flow
   */
  async initiateGoogleAuth(): Promise<void> {
    if (!this.config.google.enabled && !this.config.oauthIo.enabled) {
      // Provide helpful setup instructions
      const message = 
        'Google OAuth is not configured. To enable Google sign-in:\n\n' +
        '1. Get Google OAuth credentials from https://console.cloud.google.com/\n' +
        '2. Set VITE_GOOGLE_CLIENT_ID in your environment\n' +
        '3. Configure redirect URI: ' + `${window.location.origin}/auth/google/callback\n\n` +
        'For now, you can use the regular login form or enable mock authentication.';
      
      alert(message);
      throw new Error('Google OAuth is not configured');
    }

    // Dynamic redirect URI handling for Vercel deployments
    const currentOrigin = window.location.origin;
    
    // Try multiple redirect URI strategies
    let redirectUri: string;
    
    if (import.meta.env.VITE_GOOGLE_REDIRECT_URI_CURRENT) {
      redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI_CURRENT;
    } else if (import.meta.env.VITE_GOOGLE_REDIRECT_URI) {
      redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    } else {
      // Use current origin
      redirectUri = `${currentOrigin}/auth/google/callback`;
    }

    // Check if we're on a known working domain
    const knownWorkingDomains = [
      'final-a8xofrom7-adrian-b7e84541.vercel.app',
      'final-9i9634arf-adrian-b7e84541.vercel.app',
      'final-hd6tbubcs-adrian-b7e84541.vercel.app',
      'final-1j1ze0sc0-adrian-b7e84541.vercel.app',
      'final-jn9zr3544-adrian-b7e84541.vercel.app'
    ];
    
    const currentDomain = currentOrigin.replace('https://', '');
    if (!knownWorkingDomains.includes(currentDomain)) {
      // Alert user about potential redirect URI issue
      const shouldContinue = confirm(
        `OAuth Warning: Current domain (${currentDomain}) may not be configured in Google Cloud Console.\n\n` +
        `Expected domains: ${knownWorkingDomains.join(', ')}\n\n` +
        `Do you want to continue anyway? (Click Cancel to use mock authentication instead)`
      );
      
      if (!shouldContinue) {
        throw new Error('User cancelled OAuth due to domain mismatch');
      }
    }

    const params = new URLSearchParams({
      client_id: this.config.google.clientId,
      redirect_uri: redirectUri,
      scope: 'openid email profile',
      response_type: 'code',
      state: this.generateState(),
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    // Debug logging for development
    if (import.meta.env.DEV) {
      console.log('Google OAuth Debug:', {
        clientId: this.config.google.clientId,
        redirectUri,
        currentOrigin,
        fullAuthUrl: authUrl
      });
    }
    
    // Show user what's happening
    console.log('🔄 Redirecting to Google OAuth with:', {
      clientId: this.config.google.clientId?.substring(0, 20) + '...',
      redirectUri
    });
    
    window.location.href = authUrl;
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code: string, state: string): Promise<OAuthUserInfo> {
    if (!this.validateState(state)) {
      throw new Error('Invalid OAuth state parameter');
    }

    try {
      // SECURITY FIX: OAuth token exchange should be done on backend to protect client secret
      // For demo purposes, using mock authentication
      console.warn('OAuth disabled for security - client secrets should not be in frontend');
      
      const mockTokenResponse = {
        ok: true,
        json: async () => ({
          access_token: 'mock_google_token_' + Date.now(),
          id_token: 'mock_id_token',
          expires_in: 3600
        })
      };

      const tokenData = await mockTokenResponse.json();

      if (tokenData.error) {
        throw new Error(`Google OAuth error: ${tokenData.error_description}`);
      }

      // Fetch user info with the access token
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json();

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.picture,
        provider: 'google',
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  /**
   * Initiate GitHub OAuth flow
   */
  async initiateGitHubAuth(): Promise<void> {
    if (!this.config.github.enabled) {
      throw new Error('GitHub OAuth is not configured');
    }

    const params = new URLSearchParams({
      client_id: this.config.github.clientId,
      redirect_uri: `${window.location.origin}/auth/github/callback`,
      scope: 'user:email',
      state: this.generateState(),
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Handle GitHub OAuth callback
   */
  async handleGitHubCallback(code: string, state: string): Promise<OAuthUserInfo> {
    if (!this.validateState(state)) {
      throw new Error('Invalid OAuth state parameter');
    }

    // In a real implementation, this would exchange the code for an access token
    // via your backend service, then fetch user info
    // For now, we'll simulate the response
    
    try {
      // This would typically be done on your backend to keep the client secret secure
      // SECURITY FIX: GitHub OAuth should be handled on backend to protect client secret  
      console.warn('GitHub OAuth disabled for security - client secrets should not be in frontend');
      
      const mockGitHubResponse = {
        ok: true,
        json: async () => ({
          access_token: 'mock_github_token_' + Date.now(),
          token_type: 'bearer'
        })
      };

      const tokenData = await mockGitHubResponse.json();
      
      if (tokenData.error) {
        throw new Error(`GitHub OAuth error: ${tokenData.error_description}`);
      }

      // Fetch user info with the access token
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const userData = await userResponse.json();

      // Fetch user email (might be private)
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const emailData = await emailResponse.json();
      const primaryEmail = emailData.find((email: any) => email.primary)?.email || userData.email;

      return {
        id: userData.id.toString(),
        email: primaryEmail,
        name: userData.name || userData.login,
        avatar: userData.avatar_url,
        provider: 'google', // Using 'google' as the closest match for GitHub in our types
      };
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      throw new Error('Failed to authenticate with GitHub');
    }
  }

  /**
   * Initiate OAuth.io flow for Google/Facebook
   */
  async initiateOAuthIo(provider: 'google' | 'facebook'): Promise<OAuthUserInfo> {
    if (!this.config.oauthIo.enabled) {
      throw new Error('OAuth.io is not configured');
    }

    return new Promise((resolve, reject) => {
      // Load OAuth.io SDK if not already loaded
      if (!(window as any).OAuth) {
        const script = document.createElement('script');
        script.src = 'https://oauth.io/auth/download/latest/oauth.js';
        script.onload = () => this.performOAuthIoAuth(provider, resolve, reject);
        script.onerror = () => reject(new Error('Failed to load OAuth.io SDK'));
        document.head.appendChild(script);
      } else {
        this.performOAuthIoAuth(provider, resolve, reject);
      }
    });
  }

  /**
   * Perform OAuth.io authentication
   */
  private performOAuthIoAuth(
    provider: 'google' | 'facebook',
    resolve: (value: OAuthUserInfo) => void,
    reject: (reason: any) => void
  ): void {
    const OAuth = (window as any).OAuth;
    OAuth.initialize(this.config.oauthIo.publicKey);

    OAuth.popup(provider)
      .then((result: any) => {
        return result.me();
      })
      .then((userData: any) => {
        resolve({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          provider,
        });
      })
      .catch((error: any) => {
        console.error(`${provider} OAuth error:`, error);
        reject(new Error(`Failed to authenticate with ${provider}`));
      });
  }

  /**
   * Generate a random state parameter for OAuth security
   */
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const state = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('oauth_state', state);
    return state;
  }

  /**
   * Validate the OAuth state parameter
   */
  private validateState(state: string): boolean {
    const storedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');
    return storedState === state;
  }

  /**
   * Get available OAuth providers
   */
  getAvailableProviders(): SocialProvider[] {
    const providers: SocialProvider[] = [];
    
    if (this.config.oauthIo.enabled) {
      providers.push('google', 'facebook');
    }
    
    return providers;
  }
}

// Export singleton instance
export const oauthService = new OAuthService();
