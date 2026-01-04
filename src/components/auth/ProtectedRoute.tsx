'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'admin' | 'support' | 'provider' | 'client';
  allowedRoles?: Array<'super_admin' | 'admin' | 'support' | 'provider' | 'client'>;
  fallback?: React.ReactNode;
}

/**
 * Component to protect routes based on user role
 * Uses useCurrentUser hook that reuses existing SQL functions
 */
export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  fallback,
}: ProtectedRouteProps) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    // Check if user has required role
    if (requiredRole && user.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }

    // Check if user has one of the allowed roles
    if (allowedRoles && !allowedRoles.includes(user.role as any)) {
      router.push('/unauthorized');
      return;
    }

    setHasAccess(true);
  }, [user, loading, requiredRole, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}
