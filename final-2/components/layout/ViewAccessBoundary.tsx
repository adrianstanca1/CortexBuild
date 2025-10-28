import React from 'react';
import { User, View, Permission, Role } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import {
  evaluateViewAccess,
  getDefaultViewForUser,
  getViewDisplayName,
  viewMetadata,
  ViewAccessEvaluation,
} from '../../utils/viewAccess';

interface ViewAccessBoundaryProps {
  user: User;
  view: View;
  evaluation?: ViewAccessEvaluation;
  fallbackView?: View;
  onNavigate?: (view: View) => void;
  children: React.ReactNode;
const humanise = (value: string): string =>
  value
    .split('_')
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(' ');

}

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
export const ViewAccessBoundary: React.FC<ViewAccessBoundaryProps> = ({
  user,
  view,
  evaluation,
  fallbackView,
  onNavigate,
  children,
}) => {
  const access = evaluation ?? evaluateViewAccess(user, view);

  if (access.allowed) {
    return <>{children}</>;
  }

  const resolvedFallback = fallbackView ?? access.fallbackView ?? getDefaultViewForUser(user);
  const fallbackLabel = getViewDisplayName(resolvedFallback);
  const viewLabel = getViewDisplayName(view);
  const description = viewMetadata[view]?.description;

  const handleNavigate = (target: View) => {
    if (onNavigate) {
      onNavigate(target);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col justify-center px-6 py-12">
      <Card className="border-dashed border-destructive/40 bg-destructive/5 backdrop-blur">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">You don’t have access to {viewLabel}</h2>
              <p className="text-sm text-muted-foreground">
                {access.reason ||
                  `This workspace area is restricted for your current role. ${
                    description ? `It covers: ${description}` : ''
                  }`}
              </p>
            </div>
          </div>

          <PermissionRequirements permissions={access.missingPermissions} anyGroups={access.missingAnyPermissionGroups} />


          <AllowedRoleList roles={access.allowedRoles} />

          {onNavigate ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => handleNavigate(resolvedFallback)}>Go to {fallbackLabel}</Button>
              {resolvedFallback !== 'dashboard' && (
                <Button variant="ghost" onClick={() => handleNavigate(getDefaultViewForUser(user))}>
                  Back to {getViewDisplayName(getDefaultViewForUser(user))}
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
