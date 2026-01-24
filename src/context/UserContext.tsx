'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUserWithRole, type UserWithRole } from '@/app/actions/permissions';

interface UserContextType {
  user: UserWithRole | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const contextValue = React.useMemo(
    () => ({ user, loading, error, refetch: fetchUser }),
    [user, loading, error, fetchUser]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access the current authenticated user
 * Must be used within UserProvider
 * 
 * This replaces the old useCurrentUser hook and provides
 * a shared context to avoid duplicate API calls
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
