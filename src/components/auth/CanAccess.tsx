'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface CanAccessProps {
  children: React.ReactNode;
  permission?: keyof Omit<ReturnType<typeof usePermissions>, 'loading' | 'error' | 'refetch'>;
  role?: 'super_admin' | 'admin' | 'support' | 'provider' | 'client';
  roles?: Array<'super_admin' | 'admin' | 'support' | 'provider' | 'client'>;
  fallback?: React.ReactNode;
}

/**
 * Component to show/hide UI elements based on permissions or roles
 * Uses hooks that reuse existing SQL functions
 */
export function CanAccess({
  children,
  permission,
  role,
  roles,
  fallback = null,
}: CanAccessProps) {
  const permissions = usePermissions();
  const { user } = useCurrentUser();

  // Check permission
  if (permission) {
    if (!permissions[permission]) {
      return <>{fallback}</>;
    }
  }

  // Check specific role
  if (role && user?.role !== role) {
    return <>{fallback}</>;
  }

  // Check if user has one of the allowed roles
  if (roles && user?.role && !roles.includes(user.role as any)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
