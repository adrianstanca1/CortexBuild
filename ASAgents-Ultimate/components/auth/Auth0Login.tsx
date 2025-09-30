import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, Shield, Users, Building2 } from 'lucide-react';
import { auth0Service } from '../../services/auth0Service';

interface Auth0LoginProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export const Auth0Login: React.FC<Auth0LoginProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth0 = async () => {
      try {
        await auth0Service.initialize();

        // Check if user is already authenticated
        const isAuthenticated = await auth0Service.isAuthenticated();
        if (isAuthenticated) {
          const user = await auth0Service.getUserProfile();
          if (user && onSuccess) {
            onSuccess(user);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize authentication';
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth0();
  }, [onSuccess, onError]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await auth0Service.login();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      await auth0Service.signup();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Shield className="w-10 h-10 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold text-foreground">AS Agents</h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing secure authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <Shield className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AS Agents</h1>
        </div>
        <h2 className="text-muted-foreground">
          Secure Construction Management Platform
        </h2>
      </div>

      <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Secure Authentication
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Powered by Auth0 for enterprise-grade security
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Sign In
            </Button>

            <Button
              onClick={handleSignup}
              disabled={loading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              Create Account
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Secure authentication for asagents.co.uk
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>Multi-tenant</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Protected by Auth0 • Enterprise-grade authentication
        </p>
      </div>
    </div>
  );
};
