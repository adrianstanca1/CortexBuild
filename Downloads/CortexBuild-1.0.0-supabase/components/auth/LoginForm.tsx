import React, { useState } from 'react';
import { User } from '../../types';
import * as authService from '../../auth/authService';
import { ArrowPathIcon } from '../Icons';
import { supabase } from '../../supabaseClient';
import { validateEmail, validatePassword, combineValidations } from '../../utils/validation';

interface LoginFormProps {
    onLoginSuccess: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = React.memo(({ onLoginSuccess }) => {
    const [email, setEmail] = useState('adrian.stanca1@gmail.com');
    const [password, setPassword] = useState('Cumparavinde1');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'github' | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        console.log('🔐 Login form submitted for:', email);

        // Validate form inputs
        const validation = combineValidations(
            validateEmail(email),
            validatePassword(password)
        );

        if (!validation.isValid) {
            setError(validation.errors.join('. '));
            setIsLoading(false);
            return;
        }

        try {
            const user = await authService.login(email.trim(), password);
            console.log('✅ Login successful, user:', user);

            // Always call onLoginSuccess to trigger navigation
            onLoginSuccess(user);
        } catch (err: any) {
            console.error('❌ Login error:', err);

            // Check if it's an authentication error
            if (err.message && err.message.includes('Invalid credentials')) {
                setError('Invalid email or password. Please try again.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        if (!supabase) {
            setError('OAuth authentication is not available. Supabase is not configured.');
            return;
        }

        setError('');
        setIsOAuthLoading(provider);
        console.log(`🔐 Starting ${provider} OAuth login`);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin,
                }
            });

            if (error) {
                console.error(`❌ ${provider} OAuth error:`, error);
                setError(`${provider} login failed: ${error.message}`);
                setIsOAuthLoading(null);
            } else {
                console.log(`✅ ${provider} OAuth initiated successfully`);
            }
            // If successful, user will be redirected to OAuth provider
            // They'll come back to the dashboard and we'll handle it in the callback
        } catch (err: any) {
            console.error(`❌ ${provider} OAuth exception:`, err);
            setError(err.message || `An error occurred during ${provider} login.`);
            setIsOAuthLoading(null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-4 mb-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A.75.75 0 0010.747 15l.001-.001a.75.75 0 00.746-.894l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm text-purple-800 font-bold mb-2">
                            👑 Super Admin Access
                        </p>
                        <div className="text-xs text-purple-700 space-y-1">
                            <div>Email: <code className="bg-purple-100 px-2 py-0.5 rounded font-mono">adrian.stanca1@gmail.com</code></div>
                            <div>Password: <code className="bg-purple-100 px-2 py-0.5 rounded font-mono">Cumparavinde1</code></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A.75.75 0 0010.747 15l.001-.001a.75.75 0 00.746-.894l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm text-blue-800 font-bold mb-2">
                            🏢 Company Admin Access
                        </p>
                        <div className="text-xs text-blue-700 space-y-1">
                            <div>Email: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">adrian@ascladdingltd.co.uk</code></div>
                            <div>Password: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">lolozania1</code></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A.75.75 0 0010.747 15l.001-.001a.75.75 0 00.746-.894l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm text-green-800 font-bold mb-2">
                            💻 Developer Access
                        </p>
                        <div className="text-xs text-green-700 space-y-1">
                            <div>Email: <code className="bg-green-100 px-2 py-0.5 rounded font-mono">dev@constructco.com</code></div>
                            <div>Password: <code className="bg-green-100 px-2 py-0.5 rounded font-mono">password123</code></div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                    Email address
                </label>
                <div className="mt-1">
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <div className="mt-1">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading || isOAuthLoading !== null}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 'Sign In'}
                </button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isLoading || isOAuthLoading !== null}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    {isOAuthLoading === 'google' ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => handleOAuthLogin('github')}
                    disabled={isLoading || isOAuthLoading !== null}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    {isOAuthLoading === 'github' ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub
                        </>
                    )}
                </button>
            </div>
        </form>
    );
});

LoginForm.displayName = 'LoginForm';

export default LoginForm;