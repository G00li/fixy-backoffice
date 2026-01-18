'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/app/actions/notifications';
import { Notification, isUnread, formatTimeAgo } from '@/types/notifications';
import NotificationFilters from '@/components/notifications/NotificationFilters';

interface NotificationPageClientProps {
  userId: string;
  initialNotifications?: Notification[];
  notification?: Notification;
  unreadCount?: number;
}

export default function NotificationPageClient({
  userId,
  initialNotifications,
  notification,
  unreadCount,
}: NotificationPageClientProps) {
  const router = useRouter();
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // If this is for filters
  if (!notification && initialNotifications !== undefined) {
    const handleMarkAllRead = async () => {
      setMarkingAllRead(true);
      try {
        const result = await markAllNotificationsAsRead({
          user_id: userId,
        });

        if (result.success) {
          router.refresh();
        } else {
          console.error('Error marking all as read:', result.error);
          alert('Erro ao marcar todas como lidas. Tente novamente.');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        alert('Erro inesperado. Tente novamente.');
      } finally {
        setMarkingAllRead(false);
      }
    };

    return (
      <NotificationFilters
        onMarkAllRead={unreadCount && unreadCount > 0 ? handleMarkAllRead : undefined}
        markingAllRead={markingAllRead}
      />
    );
  }

  // If this is for a single notification
  if (notification) {
    const handleNotificationClick = async () => {
      // Mark as read if unread
      if (isUnread(notification)) {
        await markNotificationAsRead({
          notification_id: notification.id,
          user_id: userId,
          clicked: true,
        });
        router.refresh();
      }

      // Navigate if action_url exists
      if (notification.action_url) {
        router.push(notification.action_url);
      }
    };

    return (
      <button
        onClick={handleNotificationClick}
        className={`
          w-full text-left flex gap-3 rounded-lg border p-4
          transition-colors
          ${
            isUnread(notification)
              ? 'border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/20'
              : 'border-gray-100 dark:border-gray-800'
          }
          hover:bg-gray-50 dark:hover:bg-white/5
        `}
      >
        <div className="flex-shrink-0 pt-1">
          <div
            className={`h-2 w-2 rounded-full ${
              isUnread(notification)
                ? 'bg-brand-500'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4
              className={`text-base font-medium ${
                isUnread(notification)
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {notification.title}
            </h4>
            {notification.priority && (
              <span
                className={`
                  flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                  ${
                    notification.priority === 'urgent'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : notification.priority === 'high'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      : notification.priority === 'medium'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }
                `}
              >
                {notification.priority === 'urgent'
                  ? 'Urgente'
                  : notification.priority === 'high'
                  ? 'Alta'
                  : notification.priority === 'medium'
                  ? 'Média'
                  : 'Baixa'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTimeAgo(notification.created_at)}</span>
            {notification.notification_type && (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                <span className="capitalize">
                  {notification.notification_type.replace(/_/g, ' ')}
                </span>
              </>
            )}
            {notification.action_url && (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                <span className="text-brand-500 dark:text-brand-400 font-medium">
                  Clique para ver detalhes
                </span>
              </>
            )}
          </div>
        </div>
      </button>
    );
  }

  return null;
}
