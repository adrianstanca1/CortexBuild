import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User, Company, LoginCredentials, RegisterCredentials, AuthState, Permission, SocialProvider, SocialAuthRequest, CompanyAccessSummary, SwitchCompanyResponse, TenantDirectoryContext } from '../types';
import { authApi } from '../services/mockApi';
import { hasPermission as checkPermission } from '../services/auth';
import { getStorage } from '../utils/storage';

const storage = getStorage();

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ mfaRequired: boolean; userId?: string }>;
    register: (credentials: Partial<RegisterCredentials>) => Promise<AuthSuccessPayload>;
    socialLogin: (provider: SocialProvider, profile?: Partial<SocialAuthRequest>) => Promise<AuthSuccessPayload>;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
    verifyMfaAndFinalize: (userId: string, code: string) => Promise<void>;
    updateUserProfile: (updates: Partial<User>) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    refreshTenants: () => Promise<void>;
    switchCompany: (companyId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        user: null,
        company: null,
        availableCompanies: [],
        activeCompanyId: null,
        loading: true,
        error: null,
    });

    let tokenRefreshTimeout: NodeJS.Timeout | null = null;

    const logout = useCallback(() => {
        storage.removeItem('token');
        storage.removeItem('refreshToken');
        if (tokenRefreshTimeout) clearTimeout(tokenRefreshTimeout);
        setAuthState({
            isAuthenticated: false,
            token: null,
            refreshToken: null,
            user: null,
            company: null,
            availableCompanies: [],
            activeCompanyId: null,
            loading: false,
            error: null,
        });
    }, []);

    const scheduleTokenRefresh = useCallback((token: string) => {
        if (tokenRefreshTimeout) clearTimeout(tokenRefreshTimeout);

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;
            const refreshTime = Math.max(timeUntilExpiry - 60000, 0);

            if (refreshTime > 0) {
                tokenRefreshTimeout = setTimeout(async () => {
                    const storedRefreshToken = storage.getItem('refreshToken');
                    if (storedRefreshToken) {
                        try {
                            const response = await authApi.refreshToken(storedRefreshToken);
                            storage.setItem('token', response.token);
                            if (response.refreshToken) {
                                storage.setItem('refreshToken', response.refreshToken);
                            }
                            setAuthState(prev => ({
                                ...prev,
                                token: response.token,
                                refreshToken: response.refreshToken || prev.refreshToken,
                            }));
                            scheduleTokenRefresh(response.token);
                        } catch (error) {
                            console.error('Token refresh failed:', error);
                            logout();
                        }
                    }
                }, refreshTime);
            }
        } catch (error) {
            console.error('Error parsing token for refresh scheduling:', error);
        }
    }, [logout]);

    const login = useCallback(async (credentials: LoginCredentials): Promise<{ mfaRequired: boolean; userId?: string }> => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await authApi.login(credentials);

            if (response.mfaRequired) {
                setAuthState(prev => ({ ...prev, loading: false }));
                return { mfaRequired: true, userId: response.userId };
            }

            const { token, refreshToken, user, company, availableCompanies, activeCompanyId } = response;

            storage.setItem('token', token);
            if (refreshToken) {
                storage.setItem('refreshToken', refreshToken);
            }

            setAuthState({
                isAuthenticated: true,
                token,
                refreshToken,
                user,
                company,
                availableCompanies: availableCompanies || [],
                activeCompanyId,
                loading: false,
                error: null,
            });

            scheduleTokenRefresh(token);
            return { mfaRequired: false };
        } catch (error: any) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: error?.message || 'Login failed'
            }));
            throw error;
        }
    }, [scheduleTokenRefresh]);

    const register = useCallback(async (credentials: Partial<RegisterCredentials>): Promise<AuthSuccessPayload> => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await authApi.register(credentials);
            const { token, refreshToken, user, company, availableCompanies, activeCompanyId } = response;

            storage.setItem('token', token);
            if (refreshToken) {
                storage.setItem('refreshToken', refreshToken);
            }

            setAuthState({
                isAuthenticated: true,
                token,
                refreshToken,
                user,
                company,
                availableCompanies: availableCompanies || [],
                activeCompanyId: activeCompanyId || company.id,
                loading: false,
                error: null
            });

            return response;
        } catch (error: any) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: error?.message || 'Registration failed'
            }));
            throw error;
        }
    }, []);

    const socialLogin = useCallback(async (provider: SocialProvider, profile?: Partial<SocialAuthRequest>): Promise<AuthSuccessPayload> => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        try {
            // Create a minimal profile if not provided
            const authProfile: SocialAuthRequest = {
                provider,
                token: '', // Will be handled by OAuth redirect
                email: profile?.email || '',
                ...profile
            };
            
            const response = await authApi.socialLogin(provider, authProfile);
            const { token, refreshToken, user, company, availableCompanies, activeCompanyId } = response;

            storage.setItem('token', token);
            if (refreshToken) {
                storage.setItem('refreshToken', refreshToken);
            }

            setAuthState({
                isAuthenticated: true,
                token,
                refreshToken,
                user,
                company,
                availableCompanies: availableCompanies || [],
                activeCompanyId,
                loading: false,
                error: null,
            });

            scheduleTokenRefresh(token);
            return response;
        } catch (error: any) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: error?.message || 'Social login failed'
            }));
            throw error;
        }
    }, [scheduleTokenRefresh]);

    const verifyMfaAndFinalize = useCallback(async (userId: string, code: string): Promise<void> => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await authApi.verifyMfaAndFinalize(userId, code);
            const { token, refreshToken, user, company, availableCompanies, activeCompanyId } = response;

            storage.setItem('token', token);
            if (refreshToken) {
                storage.setItem('refreshToken', refreshToken);
            }

            setAuthState({
                isAuthenticated: true,
                token,
                refreshToken,
                user,
                company,
                availableCompanies: availableCompanies || [],
                activeCompanyId,
                loading: false,
                error: null,
            });

            scheduleTokenRefresh(token);
        } catch (error: any) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: error?.message || 'MFA verification failed'
            }));
            throw error;
        }
    }, [scheduleTokenRefresh]);

    const updateUserProfile = useCallback(async (updates: Partial<User>): Promise<void> => {
        if (!authState.user) return;
        try {
            const updatedUser = await authApi.updateUserProfile(authState.user.id, updates);
            setAuthState(prev => ({ ...prev, user: updatedUser }));
        } catch (error: any) {
            setAuthState(prev => ({
                ...prev,
                error: error?.message || 'Profile update failed'
            }));
            throw error;
        }
    }, [authState.user]);

    const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
        try {
            await authApi.requestPasswordReset(email);
        } catch (error: any) {
            throw error;
        }
    }, []);

    const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
        try {
            await authApi.resetPassword(token, newPassword);
        } catch (error: any) {
            throw error;
        }
    }, []);

    const hasPermission = useCallback((permission: Permission): boolean => {
        return checkPermission(authState.user, permission);
    }, [authState.user]);

    const refreshTenants = useCallback(async () => {
        try {
            const tenants: TenantDirectoryContext = await authApi.listTenants();
            setAuthState(prev => ({
                ...prev,
                availableCompanies: tenants.companies,
                activeCompanyId: tenants.activeCompanyId,
            }));
        } catch (error) {
            console.error('Failed to refresh tenant directory', error);
        }
    }, []);

    const switchCompany = useCallback(async (companyId: string) => {
        setAuthState(prev => ({ ...prev, error: null }));
        try {
            const response: SwitchCompanyResponse = await authApi.switchCompany(companyId);
            const normalizedUser: User = {
                ...response.user,
                companyId: response.activeCompanyId,
                primaryCompanyId: response.user.primaryCompanyId ?? response.user.companyId,
            };
            setAuthState(prev => ({
                ...prev,
                user: normalizedUser,
                company: response.company,
                availableCompanies: response.availableCompanies,
                activeCompanyId: response.activeCompanyId,
            }));
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, error: error?.message || 'Unable to switch company' }));
            throw error;
        }
    }, []);

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = storage.getItem('token');
            const refreshToken = storage.getItem('refreshToken');

            if (token && refreshToken) {
                try {
                    // For now, just set loading to false - in a real app, validate token
                    setAuthState(prev => ({ ...prev, loading: false }));
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    logout();
                }
            } else {
                setAuthState(prev => ({ ...prev, loading: false }));
            }
        };

        initializeAuth();
    }, [logout]);

    const value: AuthContextType = {
        ...authState,
        login,
        register,
        socialLogin,
        logout,
        hasPermission,
        verifyMfaAndFinalize,
        updateUserProfile,
        requestPasswordReset,
        resetPassword,
        refreshTenants,
        switchCompany,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};