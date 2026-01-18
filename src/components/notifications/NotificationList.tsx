import React from 'react';
import { NotificationListProps } from '@/types/notifications';
import { NotificationItem } from './NotificationItem';

/**
 * NotificationList Component
 * Displays a list of notifications with loading and empty states
 */
export function NotificationList({
  notifications,
  loading = false,
  onRead,
  onClick,
  onDismiss,
  onLoadMore,
  hasMore = false,
  emptyMessage = 'Nenhuma notificação',
  className = '',
}: NotificationListProps) {
  // Loading state
  if (loading && notifications.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="
              h-24 animate-pulse rounded-lg
              bg-gray-100 dark:bg-gray-800
            "
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (!loading && notifications.length === 0) {
    return (
      <div
        className={`
          flex flex-col items-center justify-center
          rounded-lg border border-dashed border-gray-300
          bg-gray-50 p-8 text-center
          dark:border-gray-700 dark:bg-gray-800/50
          ${className}
        `}
      >
        <svg
          className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {emptyMessage}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Você está em dia com suas notificações
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Notification Items */}
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
          onClick={onClick}
          onDismiss={onDismiss}
        />
      ))}

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="
            w-full rounded-lg border border-gray-300 bg-white
            px-4 py-2 text-sm font-medium text-gray-700
            transition-colors hover:bg-gray-50
            disabled:cursor-not-allowed disabled:opacity-50
            dark:border-gray-700 dark:bg-gray-800
            dark:text-gray-300 dark:hover:bg-gray-700
          "
        >
          {loading ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}
