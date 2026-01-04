'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusType, STATUS_TYPE_LABELS } from '@/types/provider-status';
import {
  getProviderStatus,
  updateProviderStatus,
} from '@/app/actions/provider-status';
import { showToast, toastMessages } from '@/lib/toast';

interface ProviderStatusQuickToggleProps {
  providerId: string;
}

const STATUS_CONFIG = {
  open: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  closed: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    hoverBg: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  busy: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  emergency_only: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
};

export default function ProviderStatusQuickToggle({
  providerId,
}: ProviderStatusQuickToggleProps) {
  const [currentStatus, setCurrentStatus] = useState<StatusType>('closed');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const isManualUpdateRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load current status and setup Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    
    const loadStatus = async () => {
      const result = await getProviderStatus(providerId);
      if (result.success && result.status) {
        setCurrentStatus(result.status.status_type);
      }
      setLoading(false);
    };

    loadStatus();

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
          const newStatus = payload.new as { status_type: StatusType; is_open: boolean };
          const oldStatus = payload.old as { status_type: StatusType };
          
          // Only show toast if status actually changed AND it wasn't a manual update
          if (newStatus.status_type !== oldStatus.status_type) {
            setCurrentStatus(newStatus.status_type);
            
            // Only show "auto changed" toast if it wasn't a manual update
            if (!isManualUpdateRef.current) {
              showToast.success(
                toastMessages.status.autoChanged(STATUS_TYPE_LABELS[newStatus.status_type])
              );
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [providerId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusChange = async (newStatus: StatusType) => {
    if (newStatus === currentStatus || updating) return;

    setUpdating(true);
    isManualUpdateRef.current = true; // Mark as manual update using ref
    const toastId = showToast.loading('Atualizando status...');
    
    try {
      const result = await updateProviderStatus({
        status_type: newStatus,
      });

      if (result.success && result.status) {
        setCurrentStatus(result.status.status_type);
        setIsOpen(false);
        showToast.dismiss(toastId);
        showToast.success(toastMessages.status.updated);
      } else {
        showToast.dismiss(toastId);
        showToast.error(result.error || toastMessages.status.updateError);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast.dismiss(toastId);
      showToast.error(toastMessages.status.updateError);
    } finally {
      setUpdating(false);
      // Reset manual update flag after a short delay
      setTimeout(() => {
        isManualUpdateRef.current = false;
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
    );
  }

  const config = STATUS_CONFIG[currentStatus];
  const statusOptions: StatusType[] = ['open', 'closed', 'busy', 'emergency_only'];

  return (
    <div className="hidden lg:block relative" ref={dropdownRef}>
      {/* Status Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={updating}
        className={`
          flex items-center gap-2 px-3 h-10 rounded-lg border transition-all
          ${config.bgColor} ${config.color}
          border-gray-200 dark:border-gray-800
          hover:shadow-sm
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title="Alterar status"
      >
        {updating ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          config.icon
        )}
        <span className="text-sm font-medium hidden xl:inline">
          {STATUS_TYPE_LABELS[currentStatus]}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Alterar Status
            </div>
            <div className="space-y-1">
              {statusOptions.map((status) => {
                const statusConfig = STATUS_CONFIG[status];
                const isActive = status === currentStatus;

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || isActive}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-all
                      ${isActive 
                        ? `${statusConfig.bgColor} ${statusConfig.color}` 
                        : `text-gray-700 dark:text-gray-300 ${statusConfig.hoverBg}`
                      }
                      disabled:cursor-not-allowed
                      ${!isActive && !updating && 'hover:scale-[1.02]'}
                    `}
                  >
                    <div className={`flex-shrink-0 ${statusConfig.color}`}>
                      {statusConfig.icon}
                    </div>
                    <span className="flex-1 text-left">
                      {STATUS_TYPE_LABELS[status]}
                    </span>
                    {isActive && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer with link to full status page */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-2">
            <a
              href="/provider/status"
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações avançadas
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
