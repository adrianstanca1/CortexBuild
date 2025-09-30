import React from 'react';
import { User, View, Permission, Role } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';

interface ViewAccessBoundaryProps {
  user?: User;
  view: View;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const humanise = (value: string): string =>
  value
    .split('_')
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(' ');

const PermissionRequirements: React.FC<{ permissions: Permission[]; anyGroups: Permission[][] }> = ({ permissions, anyGroups }) => {
  const uniquePermissions = Array.from(new Set(permissions));
  const sanitizedAnyGroups = anyGroups
    .map((group) => Array.from(new Set(group)))
    .filter((group) => group.length > 0);

  if (uniquePermissions.length === 0 && sanitizedAnyGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {uniquePermissions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requires all of</p>
          <div className="flex flex-wrap gap-2">
            {uniquePermissions.map((permission) => (
              <Tag key={permission} label={humanise(permission)} color="red" statusIndicator="red" />
            ))}
          </div>
        </div>
      ) : null}

      {sanitizedAnyGroups.map((group, index) => (
        <div key={`${group.join('-')}-${index}`} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {sanitizedAnyGroups.length > 1 ? `Requires any of (option ${index + 1})` : 'Requires any of'}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.map((permission) => (
              <Tag key={permission} label={humanise(permission)} color="yellow" statusIndicator="yellow" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const AllowedRoleList: React.FC<{ roles?: Role[] }> = ({ roles }) => {
  if (!roles?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Available for</p>
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <Tag key={role} label={humanise(role)} color="blue" statusIndicator="blue" />
        ))}
      </div>
    </div>
  );
};
export const ViewAccessBoundary: React.FC<ViewAccessBoundaryProps> = ({
  user,
  view,
  fallback,
  children
}) => {
  // Simplified access check for now
  if (user) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full text-center space-y-6 p-8">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Access Required</h2>
          <p className="text-muted-foreground">
            Please log in to access this view.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/login'} className="w-full">
          Login
        </Button>
      </Card>
    </div>
  );
};
