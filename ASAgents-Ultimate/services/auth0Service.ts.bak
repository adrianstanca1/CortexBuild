import { createAuth0Client, Auth0Client, User } from '@auth0/auth0-spa-js';

interface Auth0Config {
  domain: string;
  clientId: string;
  audience?: string;
  scope?: string;
  redirectUri?: string;
}

class Auth0Service {
  private auth0Client: Auth0Client | null = null;
  private config: Auth0Config;

  constructor() {
    this.config = {
      domain: import.meta.env.VITE_AUTH0_DOMAIN || 'dev-8fnhhin0d5z8ssix.uk.auth0.com',
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '1WgarJEA0yN8ArT6aeoF6NvqQiEQ5bfK',
      audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'https://asagents.co.uk/api',
      scope: import.meta.env.VITE_AUTH0_SCOPE || 'openid profile email',
      redirectUri: window.location.origin
    };
  }

  async initialize(): Promise<void> {
    try {
      this.auth0Client = await createAuth0Client({
        domain: this.config.domain,
        clientId: this.config.clientId,
        authorizationParams: {
          audience: this.config.audience,
          scope: this.config.scope,
          redirect_uri: this.config.redirectUri
        },
        cacheLocation: 'localstorage',
        useRefreshTokens: true
      });

      // Handle redirect callback
      if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
        await this.handleRedirectCallback();
      }
    } catch (error) {
      console.error('Auth0 initialization failed:', error);
      throw error;
    }
  }

  async handleRedirectCallback(): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      await this.auth0Client.handleRedirectCallback();
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Auth0 redirect callback failed:', error);
      throw error;
    }
  }

  async login(options?: { screen_hint?: 'signup' | 'login' }): Promise<void> {
    if (!this.auth0Client) {
      await this.initialize();
    }

    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      await this.auth0Client.loginWithRedirect({
        authorizationParams: {
          screen_hint: options?.screen_hint || 'login'
        }
      });
    } catch (error) {
      console.error('Auth0 login failed:', error);
      throw error;
    }
  }

  async signup(): Promise<void> {
    return this.login({ screen_hint: 'signup' });
  }

  async logout(): Promise<void> {
    if (!this.auth0Client) {
      throw new Error('Auth0 client not initialized');
    }

    try {
      await this.auth0Client.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    } catch (error) {
      console.error('Auth0 logout failed:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.auth0Client) {
      return false;
    }

    try {
      return await this.auth0Client.isAuthenticated();
    } catch (error) {
      console.error('Auth0 authentication check failed:', error);
      return false;
    }
  }

  async getUser(): Promise<User | undefined> {
    if (!this.auth0Client) {
      return undefined;
    }

    try {
      return await this.auth0Client.getUser();
    } catch (error) {
      console.error('Auth0 get user failed:', error);
      return undefined;
    }
  }

  async getAccessToken(): Promise<string | undefined> {
    if (!this.auth0Client) {
      return undefined;
    }

    try {
      return await this.auth0Client.getTokenSilently();
    } catch (error) {
      console.error('Auth0 get token failed:', error);
      return undefined;
    }
  }

  async getIdToken(): Promise<string | undefined> {
    if (!this.auth0Client) {
      return undefined;
    }

    try {
      return await this.auth0Client.getIdTokenClaims().then(claims => claims?.__raw);
    } catch (error) {
      console.error('Auth0 get ID token failed:', error);
      return undefined;
    }
  }

  // Get user profile with additional ASAgents-specific data
  async getUserProfile(): Promise<{
    id: string;
    email: string;
    name: string;
    picture?: string;
    emailVerified: boolean;
    sub: string;
  } | null> {
    const user = await this.getUser();
    if (!user) return null;

    return {
      id: user.sub || '',
      email: user.email || '',
      name: user.name || user.nickname || '',
      picture: user.picture,
      emailVerified: user.email_verified || false,
      sub: user.sub || ''
    };
  }

  // Check if user has specific permissions/roles
  async hasPermission(permission: string): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;

    try {
      // Decode JWT token to check permissions
      const payload = JSON.parse(atob(token.split('.')[1]));
      const permissions = payload.permissions || [];
      return permissions.includes(permission);
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  // Get user roles from token
  async getUserRoles(): Promise<string[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['https://asagents.co.uk/roles'] || [];
    } catch (error) {
      console.error('Get user roles failed:', error);
      return [];
    }
  }
}

// Export singleton instance
export const auth0Service = new Auth0Service();
export default auth0Service;
