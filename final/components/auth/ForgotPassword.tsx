import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AuthEnvironmentNotice } from './AuthEnvironmentNotice';

interface ForgotPasswordProps {
  onSwitchToLogin: () => void;
}

const InputField = ({ label, name, type = 'text', value = '', onChange, error }: { label: string; name: string; type?: string; value?: string; onChange: (name: string, value: string) => void; error?: string;}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-muted-foreground">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={e => onChange(name, e.target.value)} required
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${error ? 'border-destructive' : 'border-border'}`} />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
);

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSwitchToLogin }) => {
    const { requestPasswordReset, error: authError, loading: isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        try {
            await requestPasswordReset(email);
            setSuccessMessage("If an account with that email exists, a password reset link has been sent.");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="text-2xl font-bold text-foreground">Forgot Your Password?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>
            <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <AuthEnvironmentNotice className="mb-4" />
                {authError && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">{authError}</div>}
                {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}
                {successMessage ? (
                    <div className="p-3 bg-green-100 text-green-800 text-sm rounded-md">{successMessage}</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField label="Email Address" name="email" type="email" value={email} onChange={(_, val) => setEmail(val)} />
                        <Button type="submit" className="w-full" isLoading={isLoading}>Send Reset Link</Button>
                    </form>
                )}
            </Card>
            <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <button onClick={onSwitchToLogin} className="font-semibold text-primary hover:text-primary/80">
                    Sign in
                </button>
            </p>
        </div>
    );
};