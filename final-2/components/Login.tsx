import React, { useState, useEffect, useRef } from 'react';
import { LoginCredentials, SocialProvider } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { persistRememberedEmail, readRememberedEmail } from '../utils/authRememberMe';
import { AuthEnvironmentNotice } from './auth/AuthEnvironmentNotice';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

type LoginStep = 'credentials' | 'mfa';

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
    const { login, verifyMfaAndFinalize, socialLogin, error: authError, loading: isLoading } = useAuth();
    const [step, setStep] = useState<LoginStep>('credentials');
    const initialRememberedEmail = readRememberedEmail();
    const [email, setEmail] = useState(initialRememberedEmail);
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [rememberMe, setRememberMe] = useState(() => {
        if (typeof window === 'undefined') return true;
        const localPreference = window.localStorage.getItem('asagents_auth_persistence');
        if (localPreference === 'local') return true;
        const sessionPreference = window.sessionStorage.getItem('asagents_auth_persistence');
        if (sessionPreference === 'session') return false;
        return true;
    });

    const [rememberMe, setRememberMe] = useState(initialRememberedEmail !== '');
    const [showPassword, setShowPassword] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string; mfa?: string }>({});
    
    const [userId, setUserId] = useState<string | null>(null);

    const mfaInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setError(authError);
    }, [authError]);

    useEffect(() => {
        if (!rememberMe) {
            persistRememberedEmail(false, '');
        }
    }, [rememberMe]);

    useEffect(() => {
      if (step === 'mfa') {
        mfaInputRef.current?.focus();
      }
    }, [step]);
    
    const clearValidationError = (field: 'email' | 'password' | 'mfa') => {
        setValidationErrors(prev => {
            if (!prev[field]) {
                return prev;
            }
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleCredentialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const newErrors: { email?: string; password?: string } = {};
        const trimmedEmail = email.trim();
        if (!validateEmail(trimmedEmail)) newErrors.email = "Please enter a valid email.";
        if (password.length < 6) newErrors.password = "Password is too short.";

        setValidationErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setEmail(trimmedEmail);
            const res = await login({ email: trimmedEmail, password, rememberMe });
            if (res.mfaRequired && res.userId) {
                setUserId(res.userId);
                setStep('mfa');
                setMfaCode('');
                setValidationErrors(prev => {
                    if (!prev.mfa) {
                        return prev;
                    }
                    const next = { ...prev };
                    delete next.mfa;
                    return next;
                });
            } else {
                persistRememberedEmail(rememberMe, trimmedEmail.toLowerCase());
            }
            setPassword('');
            // If not MFA, the AuthProvider handles the redirect and state change.
        } catch (err) {
            // Error is handled and set by the AuthContext, no need to set it here.
        }
    };
    
    const handleMfaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (mfaCode.length !== 6) {
            setValidationErrors({ mfa: "Code must be 6 digits." });
            return;
        }
        
        try {
            if (!userId) throw new Error("User ID not found");
            await verifyMfaAndFinalize(userId, mfaCode);
            persistRememberedEmail(rememberMe, email.trim().toLowerCase());
            setMfaCode('');
            // On success, AuthProvider will handle redirect.
        } catch (err) {
             // Error is handled and set by the AuthContext
        }
    };
    
    const handleSocialLogin = async (provider: SocialProvider) => {
        setError(null);
        try {
            await socialLogin(provider);
        } catch (err: any) {
            setError(err?.message ?? `Unable to sign in with ${provider}.`);
        }
    };

    const renderCredentialStep = () => (
      <form onSubmit={handleCredentialSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => {
                setEmail(e.target.value);
                clearValidationError('email');
                setError(null);
            }}
            required
            autoComplete="email"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${validationErrors.email ? 'border-destructive' : 'border-border'}`}
          />
          {validationErrors.email && <p className="text-xs text-destructive mt-1">{validationErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="password"  className="block text-sm font-medium text-muted-foreground">Password</label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => {
                  setPassword(e.target.value);
                  clearValidationError('password');
                  setError(null);
              }}
              required
              autoComplete="current-password"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-12 ${validationErrors.password ? 'border-destructive' : 'border-border'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {validationErrors.password && <p className="text-xs text-destructive mt-1">{validationErrors.password}</p>}
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <input id="remember-me" type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-4 w-4 text-primary focus:ring-ring border-border rounded"/>
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">Remember me</label>
            </div>
            <div className="text-sm">
                <button type="button" onClick={onSwitchToForgotPassword} className="font-medium text-primary hover:text-primary/90">Forgot your password?</button>
            </div>
        </div>
        <div>
          <Button type="submit" className="w-full" isLoading={isLoading}>Sign in</Button>
        </div>
      </form>
    );

    const renderMfaStep = () => (
      <form onSubmit={handleMfaSubmit} className="space-y-6">
        <div className="text-center">
            <h3 className="text-lg font-medium text-foreground">Two-Factor Authentication</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
        </div>
        <div>
          <label htmlFor="mfa" className="sr-only">Authentication Code</label>
          <input
            id="mfa"
            type="text"
            ref={mfaInputRef}
            value={mfaCode}
            onChange={e => {
                const sanitized = e.target.value.replace(/\D/g, '');
                setMfaCode(sanitized);
                clearValidationError('mfa');
                setError(null);
            }}
            maxLength={6}
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            className={`block w-full text-center text-2xl tracking-[0.5em] px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${validationErrors.mfa ? 'border-destructive' : 'border-border'}`}
          />
          {validationErrors.mfa && <p className="text-xs text-destructive mt-1 text-center">{validationErrors.mfa}</p>}
        </div>
         <div>
          <Button type="submit" className="w-full" isLoading={isLoading}>Verify</Button>
        </div>
         <div className="text-center">
            <button type="button" onClick={() => setStep('credentials')} className="text-sm font-medium text-primary hover:text-primary/90">Back to login</button>
        </div>
      </form>
    );
  
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
             <div className="inline-flex items-center justify-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-10 h-10 text-primary">
                    <path fill="currentColor" d="M12 2L2 22h20L12 2z"/>
                </svg>
                <h1 className="text-3xl font-bold text-foreground">AS Agents</h1>
            </div>
          <h2 className="text-muted-foreground">
            Sign in to your account
          </h2>
        </div>
        <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <AuthEnvironmentNotice className="mb-4" />
            <div className="space-y-3 px-4">
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleSocialLogin('google')}
                    isLoading={isLoading}
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.09-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.05-3.71 1.05-2.85 0-5.26-1.92-6.13-4.49H2.18v2.82C3.99 21.53 7.68 24 12 24z" />
                        <path fill="#FBBC05" d="M5.87 15.13c-.22-.66-.35-1.36-.35-2.13s.13-1.47.35-2.13V8.05H2.18A11.99 11.99 0 000 12.99c0 1.9.45 3.69 1.18 4.94l4.69-2.8z" />
                        <path fill="#EA4335" d="M12 4.75c1.62 0 3.07.56 4.21 1.64l3.16-3.16C17.46 1.16 14.97 0 12 0 7.68 0 3.99 2.47 2.18 6.05l3.69 2.82C6.74 6.67 9.15 4.75 12 4.75z" />
                        <path fill="none" d="M0 0h24v24H0z" />
                    </svg>
                    Continue with Google
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleSocialLogin('facebook')}
                    isLoading={isLoading}
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.09 4.388 23.093 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.492 0-1.955.931-1.955 1.887v2.252h3.328l-.532 3.493h-2.796V24C19.612 23.093 24 18.09 24 12.073z" />
                    </svg>
                    Continue with Facebook
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 border-t border-dashed border-border" />
                    <span>or use your email</span>
                    <div className="flex-1 border-t border-dashed border-border" />
                </div>
            </div>
            {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">{error}</div>}
            {step === 'credentials' ? renderCredentialStep() : renderMfaStep()}
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
            Not a member?{' '}
            <button onClick={onSwitchToRegister} className="font-semibold text-primary hover:text-primary/80">
                Create an account
            </button>
        </p>
      </div>
    );
};
