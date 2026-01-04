'use client';

import { useEffect, useState } from 'react';
import { checkUserPermissions, type PermissionCheck } from '@/app/actions/permissions';

interface UsePermissionsReturn extends PermissionCheck {
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check user permissions
 * Uses server action that reuses existing SQL functions
 */
export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<PermissionCheck>({
    canManageUsers: false,
    canAccessSupport: false,
    canManageProviders: false,
    canAccessAdmin: false,
    isProvider: false,
    isClient: false,
    isSuperAdmin: false,
    isAdmin: false,
    isSupport: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await checkUserPermissions();
      setPermissions(result);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    ...permissions,
    loading,
    error,
    refetch: fetchPermissions,
  };
}
