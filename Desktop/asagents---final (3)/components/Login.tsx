import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const Login: React.FC<{ onLogin: (user: User, token: string) => void; }> = ({ onLogin }) => {
  const [email, setEmail] = useState('alice@construction.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
          const { user, token } = await api.login(email, password);
          onLogin(user, token);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm z-10">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-9 h-9 text-primary">
                    <path fill="currentColor" d="M12 2L2 22h20L12 2z" opacity="0.5"/>
                    <path fill="currentColor" d="M12 8.66L16.66 17H7.33L12 8.66z"/>
                </svg>
                <h1 className="text-3xl font-bold">AS Agents</h1>
            </div>
            <p className="text-muted-foreground">Sign in to your account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mt-1 w-full"
                    required
                />
            </div>
             <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mt-1 w-full"
                    required
                />
            </div>
            
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" isLoading={loading}>
                Sign In
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-2">
                Use `alice@construction.com`, `bob@construction.com`, or `diana@construction.com` with password `password123` to log in.
            </p>
        </form>
      </Card>
    </div>
  );
};