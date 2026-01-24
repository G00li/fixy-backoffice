'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusType, ProviderStatus } from '@/types/provider-status';
import { getProviderStatus, updateProviderStatus } from '@/app/actions/provider-status';

interface ProviderStatusContextType {
  status: ProviderStatus | null;
  loading: boolean;
  updating: boolean;
  updateStatus: (newStatus: StatusType, message?: string, autoCloseHours?: number) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

const ProviderStatusContext = createContext<ProviderStatusContextType | undefined>(undefined);

interface ProviderStatusProviderProps {
  providerId: string;
  children: React.ReactNode;
}

export function ProviderStatusProvider({ providerId, children }: ProviderStatusProviderProps) {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const isManualUpdateRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await getProviderStatus(providerId);
      if (result.success && result.status) {
        setStatus(result.status);
      }
    } catch (error) {
      console.error('Error fetching provider status:', error);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  // Initial load and Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    
    fetchStatus();

    // Subscribe to realtime changes for this provider's status
    const channel = supabase
      .channel(`provider-status-${providerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'provider_status',
          filter: `provider_id=eq.${providerId}`,
        },
        (payload) => {
          const newStatus = payload.new as ProviderStatus;
          
          // Update status in context
          setStatus(newStatus);
          
          // Reset manual update flag after realtime update
          if (isManualUpdateRef.current) {
            setTimeout(() => {
              isManualUpdateRef.current = false;
            }, 1000);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [providerId, fetchStatus]);

  const handleUpdateStatus = useCallback(async (
    newStatus: StatusType,
    message?: string,
    autoCloseHours?: number
  ) => {
    if (updating) {
      return { success: false, error: 'Update already in progress' };
    }

    setUpdating(true);
    isManualUpdateRef.current = true;
    
    try {
      const result = await updateProviderStatus({
        status_type: newStatus,
        status_message: message,
        auto_close_hours: autoCloseHours,
      });

      if (result.success && result.status) {
        setStatus(result.status);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error updating status:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setUpdating(false);
    }
  }, [updating]);

  const contextValue = React.useMemo(
    () => ({
      status,
      loading,
      updating,
      updateStatus: handleUpdateStatus,
      refetch: fetchStatus,
    }),
    [status, loading, updating, handleUpdateStatus, fetchStatus]
  );

  return (
    <ProviderStatusContext.Provider value={contextValue}>
      {children}
    </ProviderStatusContext.Provider>
  );
}

export function useProviderStatus() {
  const context = useContext(ProviderStatusContext);
  if (context === undefined) {
    throw new Error('useProviderStatus must be used within a ProviderStatusProvider');
  }
  return context;
}
