import React, { useState } from 'react';
import { User } from '../../types';
import * as authService from '../../auth/authService';
import { ArrowPathIcon } from '../Icons';
import { validateEmail, validatePassword, combineValidations } from '../../utils/validation';
import { Eye, EyeOff, Database, Cpu, Shield, Zap, LogIn } from 'lucide-react';

interface LoginFormProps {
    onLoginSuccess: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = React.memo(({ onLoginSuccess }) => {
    const [email, setEmail] = useState('adrian.stanca1@gmail.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedUser, setSelectedUser] = useState(0);

    // Predefined users based on better-sqlite3 database
    const predefinedUsers = [
        {
            email: 'adrian.stanca1@gmail.com',
            password: 'password123',
            name: 'Adrian Stanca',
            role: 'Super Admin',
            description: 'Full platform access + Developer Dashboard',
            icon: Shield,
            color: 'from-red-500 to-red-600'
        },
        {
            email: 'adrian@ascladdingltd.co.uk',
            password: 'lolozania1',
            name: 'Adrian ASC',
            role: 'Company Admin',
            description: 'Company management + Base44Clone',
            icon: Database,
            color: 'from-blue-500 to-blue-600'
        },
        {
            email: 'adrian.stanca1@icloud.com',
            password: 'password123',
            name: 'Adrian Stanca',
            role: 'Developer',
            description: 'Developer Console + SDK Tools',
            icon: Cpu,
            color: 'from-green-500 to-green-600'
        },
        {
            email: 'dev@constructco.com',
            password: 'parola123',
            name: 'Developer User',
            role: 'Developer',
            description: 'Development environment access',
            icon: Zap,
            color: 'from-purple-500 to-purple-600'
        }
    ];

    const selectUser = (index: number) => {
        const user = predefinedUsers[index];
        setSelectedUser(index);
        setEmail(user.email);
        setPassword(user.password);
        setError('');
    };

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
            onLoginSuccess(user);
        } catch (err: any) {
            console.error('❌ Login error:', err);
            if (err.message && err.message.includes('Invalid credentials')) {
                setError('Invalid email or password. Please try again.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                            <Database className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">CortexBuild</h2>
                    <p className="text-sm text-gray-600">
                        Powered by <span className="font-semibold text-blue-600">better-sqlite3</span> • Golden Source
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick User Selection */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-blue-600" />
                            Quick Login
                        </h3>
                        <div className="space-y-3">
                            {predefinedUsers.map((user, index) => {
                                const IconComponent = user.icon;
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => selectUser(index)}
                                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                            selectedUser === index
                                                ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg bg-gradient-to-r ${user.color} mr-3 shadow-sm`}>
                                                <IconComponent className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-gray-900">{user.name}</span>
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{user.description}</p>
                                                <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isLoading ? (
                                    <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <LogIn className="w-5 h-5 mr-2" />
                                )}
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </div>

                    {/* Database Info */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center">
                            <Database className="w-5 h-5 text-green-600 mr-2" />
                            <div>
                                <p className="text-sm font-medium text-green-800">Database Status</p>
                                <p className="text-xs text-green-600">better-sqlite3 • WAL Mode • 50+ Tables</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
});

LoginForm.displayName = 'LoginForm';

export default LoginForm;
