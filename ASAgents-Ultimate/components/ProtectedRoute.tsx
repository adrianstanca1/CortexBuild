import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role, Permission } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: Permission;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  fallback,
}) => {
  const { user, loading, hasPermission } = useAuth();

  const UnauthorizedAccess = () => (
    fallback || (
      <Card className="border-destructive/50 bg-destructive/5 dark:bg-destructive/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
            <p className="text-muted-foreground mt-1">
              You do not have the necessary permissions to view this content.
            </p>
          </div>
        </div>
      </Card>
    )
  );

  if (loading) {
    return (
      <Card>
        <p>Authenticating...</p>
      </Card>
    );
  }

  // This check is for components used deep within the app.
  // The main App component handles the initial login screen.
  if (!user) {
    return <UnauthorizedAccess />;
  }

  const isRoleAllowed = allowedRoles ? allowedRoles.includes(user.role) : true;
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true;

  if (!isRoleAllowed || !hasRequiredPermission) {
    return <UnauthorizedAccess />;
  }

  return <>{children}</>;
};
