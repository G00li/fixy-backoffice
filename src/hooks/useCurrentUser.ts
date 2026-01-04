'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserWithRole, type UserWithRole } from '@/app/actions/permissions';

interface UseCurrentUserReturn {
  user: UserWithRole | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get current authenticated user with their role
 * Uses server action that reuses existing SQL functions
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getCurrentUserWithRole();
      
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setError(result.error || 'Failed to get user');
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('An unexpected error occurred');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
