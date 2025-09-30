import { auth0Service } from './auth0Service';

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  role?: 'admin' | 'manager' | 'user';
  tenantName?: string;
  planType?: 'free' | 'growth' | 'enterprise';
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingConsent?: boolean;
}

export interface RegistrationResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
  };
  tenant?: {
    id: string;
    name: string;
    plan: string;
  };
  message?: string;
  error?: string;
  requiresEmailVerification?: boolean;
}

export interface TenantSetupData {
  name: string;
  plan: 'free' | 'growth' | 'enterprise';
  industry?: string;
  companySize?: string;
  country?: string;
  timezone?: string;
  currency?: string;
}

class RegistrationService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || '/api';
  }

  // Complete user registration with Auth0 and tenant setup
  async registerUser(data: RegistrationData): Promise<RegistrationResult> {
    try {
      // Validate registration data
      this.validateRegistrationData(data);

      // Step 1: Register user with Auth0
      const auth0Result = await this.registerWithAuth0(data);
      if (!auth0Result.success) {
        return auth0Result;
      }

      // Step 2: Create tenant if needed
      let tenantResult;
      if (data.tenantName) {
        tenantResult = await this.createTenant({
          name: data.tenantName,
          plan: data.planType || 'free'
        });
      }

      // Step 3: Create user profile in our system
      const profileResult = await this.createUserProfile(data, auth0Result.user?.id);

      return {
        success: true,
        user: auth0Result.user,
        tenant: tenantResult?.tenant,
        message: 'Registration successful! Please check your email to verify your account.',
        requiresEmailVerification: true
      };

    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // Register user with Auth0
  private async registerWithAuth0(data: RegistrationData): Promise<RegistrationResult> {
    try {
      // Use Auth0 Management API to create user
      const response = await fetch(`${this.apiUrl}/auth0/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`,
          given_name: data.firstName,
          family_name: data.lastName,
          user_metadata: {
            company: data.company,
            phone: data.phone,
            role: data.role || 'user',
            registration_source: 'asagents_platform'
          },
          app_metadata: {
            tenant_id: null, // Will be set after tenant creation
            plan: data.planType || 'free',
            permissions: this.getDefaultPermissions(data.role || 'user')
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Auth0 registration failed');
      }

      const result = await response.json();
      return {
        success: true,
        user: result.user,
        requiresEmailVerification: true
      };

    } catch (error) {
      console.error('Auth0 registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Auth0 registration failed'
      };
    }
  }

  // Create tenant for new organization
  async createTenant(data: TenantSetupData): Promise<{ success: boolean; tenant?: any; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          plan: data.plan,
          settings: {
            industry: data.industry,
            companySize: data.companySize,
            country: data.country,
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            currency: data.currency || 'USD'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tenant creation failed');
      }

      const result = await response.json();
      return {
        success: true,
        tenant: result.tenant
      };

    } catch (error) {
      console.error('Tenant creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tenant creation failed'
      };
    }
  }

  // Create user profile in our system
  private async createUserProfile(data: RegistrationData, auth0UserId?: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth0_id: auth0UserId,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company,
          phone: data.phone,
          role: data.role || 'user',
          preferences: {
            marketing_consent: data.marketingConsent || false,
            email_notifications: true,
            push_notifications: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile creation failed');
      }

      return await response.json();

    } catch (error) {
      console.error('Profile creation failed:', error);
      throw error;
    }
  }

  // Validate registration data
  private validateRegistrationData(data: RegistrationData): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Valid email address is required');
    }

    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!data.firstName || data.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters long');
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }

    if (!data.acceptTerms) {
      throw new Error('You must accept the terms of service');
    }

    if (!data.acceptPrivacy) {
      throw new Error('You must accept the privacy policy');
    }

    // Validate password strength
    if (!this.isStrongPassword(data.password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
  }

  // Email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength validation
  private isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  // Get default permissions based on role
  private getDefaultPermissions(role: string): string[] {
    const permissions = {
      admin: [
        'read:projects', 'write:projects', 'delete:projects',
        'read:users', 'write:users', 'delete:users',
        'read:invoices', 'write:invoices', 'delete:invoices',
        'read:reports', 'write:reports',
        'manage:settings', 'manage:billing'
      ],
      manager: [
        'read:projects', 'write:projects',
        'read:users', 'write:users',
        'read:invoices', 'write:invoices',
        'read:reports', 'write:reports'
      ],
      user: [
        'read:projects', 'write:projects',
        'read:invoices',
        'read:reports'
      ]
    };

    return permissions[role as keyof typeof permissions] || permissions.user;
  }

  // Verify email address
  async verifyEmail(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/auth0/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Email verification failed');
      }

      const result = await response.json();
      return {
        success: true,
        message: 'Email verified successfully!'
      };

    } catch (error) {
      console.error('Email verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email verification failed'
      };
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/auth0/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend verification email');
      }

      return {
        success: true,
        message: 'Verification email sent successfully!'
      };

    } catch (error) {
      console.error('Resend verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend verification email'
      };
    }
  }
}

// Export singleton instance
export const registrationService = new RegistrationService();
export default registrationService;
