import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User, Company, LoginCredentials, RegisterCredentials, AuthState, Permission } from '../types';
import { authApi } from '../services/mockApi';
import { hasPermission as checkPermission } from '../services/auth';
import { api } from '../services/mockApi';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ mfaRequired: boolean; userId?: string }>;
    register: (credentials: Partial<RegisterCredentials>) => Promise<void>;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
    verifyMfaAndFinalize: (userId: string, code: string) => Promise<void>;
    updateUserProfile: (updates: Partial<User>) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

let tokenRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        user: null,
        company: null,
        loading: true,
        error: null,
    });

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (tokenRefreshTimeout) clearTimeout(tokenRefreshTimeout);
        setAuthState({
            isAuthenticated: false,
            token: null,
            refreshToken: null,
            user: null,
            company: null,
            loading: false,
            error: null,
        });
    }, []);

    /**
     * Proactively schedules a token refresh before the current access token expires.
     * This improves UX by preventing the user from being logged out during an active session.
     */
    const scheduleTokenRefresh = useCallback((token: string) => {
        if (tokenRefreshTimeout) {
            clearTimeout(tokenRefreshTimeout);
        }
        const decoded = parseJwt(token);
        if (decoded && decoded.exp) {
            // Refresh 1 minute before expiry to be safe
            const expiresIn = (decoded.exp * 1000) - Date.now() - 60000;
            if (expiresIn > 0) {
                tokenRefreshTimeout = setTimeout(async () => {
                    const storedRefreshToken = localStorage.getItem('refreshToken');
                    if (storedRefreshToken) {
                        try {
                            console.log("Proactively refreshing token...");
                            const { token: newToken } = await authApi.refreshToken(storedRefreshToken);
                            localStorage.setItem('token', newToken);
                            setAuthState(prev => ({ ...prev, token: newToken }));
                            scheduleTokenRefresh(newToken); // Schedule the next refresh
                        } catch (error) {
                            console.error("Proactive token refresh failed", error);
                            logout();
                        }
                    }
                }, expiresIn);
            } else {
                // Token already expired or about to, attempt a reactive refresh or log out.
                console.warn("Token is already expired or has less than a minute left. Logging out.");
                logout();
            }
        }
    }, [logout]);
    
    const finalizeLogin = useCallback((data: { token: string, refreshToken: string, user: User, company: Company }) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        setAuthState({
            isAuthenticated: true,
            token: data.token,
            refreshToken: data.refreshToken,
            user: data.user,
            company: data.company,
            loading: false,
            error: null,
        });
        scheduleTokenRefresh(data.token);
    }, [scheduleTokenRefresh]);

    /**
     * Initializes authentication state on app load.
     * It checks for stored tokens and attempts to validate the session.
     * If the access token is expired, it reactively tries to use the refresh token.
     */
    const initAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        if (token && refreshToken) {
            try {
                // First, try to authenticate with the existing access token.
                const { user, company } = await authApi.me(token);
                finalizeLogin({ token, refreshToken, user, company });
            } catch (error) {
                // If authApi.me fails (e.g., token expired), attempt to refresh the token.
                console.log("Access token invalid, attempting reactive refresh...");
                try {
                    const { token: newToken } = await authApi.refreshToken(refreshToken);
                    const { user, company } = await authApi.me(newToken);
                    finalizeLogin({ token: newToken, refreshToken, user, company });
                } catch (refreshError) {
                    console.error("Auth init with refresh token failed, logging out.", refreshError);
                    logout();
                }
            }
        } else {
            setAuthState(prev => ({ ...prev, loading: false }));
        }
    }, [finalizeLogin, logout]);

    useEffect(() => {
        initAuth();
        return () => {
            if (tokenRefreshTimeout) clearTimeout(tokenRefreshTimeout);
        }
    }, [initAuth]);

    const login = async (credentials: LoginCredentials): Promise<{ mfaRequired: boolean; userId?: string }> => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await authApi.login(credentials);
            if (response.mfaRequired) {
                setAuthState(prev => ({ ...prev, loading: false }));
                return { mfaRequired: true, userId: response.userId };
            }
            
            finalizeLogin(response);
            return { mfaRequired: false };

        } catch (error: any) {
            setAuthState(prev => ({ ...prev, token: null, refreshToken: null, user: null, company: null, isAuthenticated: false, loading: false, error: error.message || 'Login failed' }));
            throw error;
        }
    };
    
    const verifyMfaAndFinalize = async (userId: string, code: string) => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
         try {
            const response = await authApi.verifyMfa(userId, code);
            finalizeLogin(response);
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, loading: false, error: error.message || 'MFA verification failed'}));
            throw error;
        }
    }

    const register = async (credentials: Partial<RegisterCredentials>) => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await authApi.register(credentials);
            finalizeLogin(response);
        } catch (error: any) {
             setAuthState(prev => ({ ...prev, loading: false, error: error.message || 'Registration failed'}));
            throw error;
        }
    };

    const hasPermission = (permission: Permission): boolean => {
        return checkPermission(authState.user, permission);
    };

    const updateUserProfile = async (updates: Partial<User>) => {
        if (!authState.user) throw new Error("Not authenticated");
        // Pass undefined for projectIds to avoid triggering assignment updates
        const updatedUser = await api.updateUser(authState.user.id, updates, undefined, authState.user.id);
        setAuthState(prev => ({
            ...prev,
            user: { ...prev.user, ...updatedUser } as User,
        }));
    };

    const requestPasswordReset = async (email: string) => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        try {
            await authApi.requestPasswordReset(email);
            setAuthState(prev => ({ ...prev, loading: false }));
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, loading: false, error: error.message || 'Request failed'}));
            throw error;
        }
    };

    const resetPassword = async (token: string, newPassword: string) => {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        try {
            await authApi.resetPassword(token, newPassword);
            setAuthState(prev => ({ ...prev, loading: false }));
        } catch (error: any) {
            setAuthState(prev => ({ ...prev, loading: false, error: error.message || 'Password reset failed'}));
            throw error;
        }
    };
    
    const value = {
        ...authState,
        login,
        register,
        logout,
        hasPermission,
        verifyMfaAndFinalize,
        updateUserProfile,
        requestPasswordReset,
        resetPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
