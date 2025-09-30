import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AuthEnvironmentNotice } from './AuthEnvironmentNotice';

interface ResetPasswordProps {
  token: string;
  onSuccess: () => void;
}

const PasswordStrengthIndicator: React.FC<{ password?: string }> = ({ password = '' }) => {
    const getStrength = () => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    };
    const strength = getStrength();
    const width = (strength / 5) * 100;
    const color = strength < 3 ? 'bg-destructive' : strength < 5 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width: `${width}%` }}></div>
        </div>
    );
};

const InputField = ({ label, name, type = 'text', value = '', onChange, error }: { label: string; name: string; type?: string; value?: string; onChange: (name: string, value: string) => void; error?: string;}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-muted-foreground">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={e => onChange(name, e.target.value)} required
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${error ? 'border-destructive' : 'border-border'}`} />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
);


export const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onSuccess }) => {
    const { resetPassword, error: authError, loading: isLoading } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setError(authError);
    }, [authError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (err: any) {
            // Error is handled by auth context
        }
    };

    if (success) {
        return (
             <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <Card className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <AuthEnvironmentNotice className="mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-4">Password Reset Successfully!</h2>
                    <p className="text-muted-foreground mb-6">You can now sign in with your new password.</p>
                    <Button onClick={onSuccess} className="w-full">Back to Sign In</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="text-2xl font-bold text-foreground">Reset Your Password</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enter and confirm your new password below.
                </p>
            </div>
            <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                 <AuthEnvironmentNotice className="mb-4" />
                 {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField label="New Password" name="password" type="password" value={password} onChange={(_, val) => setPassword(val)} />
                    <PasswordStrengthIndicator password={password} />
                    <InputField label="Confirm New Password" name="confirmPassword" type="password" value={confirmPassword} onChange={(_, val) => setConfirmPassword(val)} />
                    <Button type="submit" className="w-full" isLoading={isLoading}>Reset Password</Button>
                </form>
            </Card>
        </div>
    );
};