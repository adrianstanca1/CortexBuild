import React, { useState } from 'react';
import { User } from '../../types';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';

interface AuthScreenProps {
    onLoginSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    {isLoginView ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-center text-gray-500 mb-8">
                    {isLoginView ? 'Sign in to continue to ConstructAI' : 'Get started with your new account'}
                </p>

                {isLoginView ? (
                    <LoginForm onLoginSuccess={onLoginSuccess} />
                ) : (
                    <RegisterForm onLoginSuccess={onLoginSuccess} />
                )}

                <p className="text-center text-sm text-gray-600 mt-8">
                    {isLoginView ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => setIsLoginView(!isLoginView)}
                        className="font-semibold text-blue-600 hover:text-blue-500 ml-1"
                    >
                        {isLoginView ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;