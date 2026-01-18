import React from 'react';
import Link from 'next/link';
import {
  NotificationItemProps,
  formatTimeAgo,
  getPriorityColor,
  isUnread,
} from '@/types/notifications';

/**
 * NotificationItem Component
 * Displays a single notification item
 */
export function NotificationItem({
  notification,
  onRead,
  onClick,
  onDismiss,
  showActions = true,
  className = '',
}: NotificationItemProps) {
  const unread = isUnread(notification);

  const handleClick = () => {
    if (onClick) {
      onClick(notification.id);
    }
    if (unread && onRead) {
      onRead(notification.id);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss(notification.id);
    }
  };

  const content = (
    <div
      className={`
        flex gap-3 rounded-lg border p-3 px-4.5 py-3
        transition-colors
        ${
          unread
            ? 'border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/20'
            : 'border-gray-100 dark:border-gray-800'
        }
        hover:bg-gray-50 dark:hover:bg-white/5
        ${className}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Priority Indicator */}
      <div className="flex-shrink-0">
        <div
          className={`
            h-2 w-2 rounded-full
            ${getPriorityColor(notification.priority)}
          `}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h4
            className={`
              text-sm font-medium
              ${
                unread
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }
            `}
          >
            {notification.title}
          </h4>
          {showActions && onDismiss && (
            <button
              onClick={handleDismiss}
              className="
                flex-shrink-0 text-gray-400 transition-colors
                hover:text-gray-600 dark:hover:text-gray-200
              "
              aria-label="Dismiss notification"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
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
        </div>
      </div>

      {/* Unread Indicator */}
      {unread && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-brand-500" />
        </div>
      )}
    </div>
  );

  // Wrap in Link if action_url exists
  if (notification.action_url) {
    return (
      <Link href={notification.action_url} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
