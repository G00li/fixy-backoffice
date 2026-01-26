'use client';

import React, { useState, useCallback } from 'react';
import { NotificationPreference } from '@/types/notifications';
import { updateNotificationPreference } from '@/app/actions/notifications';
import PreferenceToggle from './PreferenceToggle';
import { useRouter } from 'next/navigation';

interface NotificationPreferencesProps {
  userId: string;
  initialPreferences: NotificationPreference[];
}

// Debounce helper
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  );
}

export default function NotificationPreferences({
  userId,
  initialPreferences,
}: NotificationPreferencesProps) {
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreference[]>(initialPreferences);
  const [updatingTypes, setUpdatingTypes] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleUpdate = async (
    notificationType: string,
    updates: Partial<NotificationPreference>
  ) => {
    // Add to updating set
    setUpdatingTypes((prev) => new Set(prev).add(notificationType));

    try {
      // Optimistic update
      setPreferences((prev) =>
        prev.map((pref) =>
          pref.notification_type === notificationType
            ? { ...pref, ...updates }
            : pref
        )
      );

      // Call server action
      // Filter out null values to match the expected type
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== null)
      );
      
      const result = await updateNotificationPreference({
        user_id: userId,
        notification_type: notificationType,
        ...filteredUpdates,
      });

      if (result.success) {
        showToast('Preferência atualizada com sucesso', 'success');
        router.refresh();
      } else {
        // Revert on error
        setPreferences(initialPreferences);
        showToast(result.error || 'Erro ao atualizar preferência', 'error');
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      setPreferences(initialPreferences);
      showToast('Erro inesperado ao atualizar preferência', 'error');
    } finally {
      // Remove from updating set
      setUpdatingTypes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationType);
        return newSet;
      });
    }
  };

  // Debounced update for quiet hours (to avoid too many calls while typing)
  const debouncedUpdate = useDebounce(handleUpdate, 1000);

  const handlePreferenceUpdate = async (
    notificationType: string,
    updates: Partial<NotificationPreference>
  ) => {
    // For quiet hours, use debounced update
    if ('quiet_hours_start' in updates || 'quiet_hours_end' in updates) {
      debouncedUpdate(notificationType, updates);
    } else {
      // For other updates, call immediately
      await handleUpdate(notificationType, updates);
    }
  };

  // Sort preferences: enabled first, then alphabetically
  const sortedPreferences = [...preferences].sort((a, b) => {
    if (a.enabled === b.enabled) {
      return a.notification_type.localeCompare(b.notification_type);
    }
    return a.enabled ? -1 : 1;
  });

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`
            fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg
            ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }
          `}
        >
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Preferences List */}
      {sortedPreferences.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Nenhuma preferência encontrada
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            As preferências serão criadas automaticamente quando você receber notificações
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPreferences.map((preference) => (
            <PreferenceToggle
              key={preference.id}
              preference={preference}
              onUpdate={(updates) =>
                handlePreferenceUpdate(preference.notification_type, updates)
              }
              updating={updatingTypes.has(preference.notification_type)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {sortedPreferences.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>{sortedPreferences.filter((p) => p.enabled).length}</strong> de{' '}
              <strong>{sortedPreferences.length}</strong> tipos de notificação ativos
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
