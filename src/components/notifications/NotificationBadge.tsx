import React from 'react';
import { NotificationBadgeProps, NotificationPriority } from '@/types/notifications';

/**
 * NotificationBadge Component
 * Displays a badge with notification count
 */
export function NotificationBadge({
  count,
  priority,
  className = '',
}: NotificationBadgeProps) {
  if (count === 0) return null;

  // Get badge color based on priority
  const getBadgeColor = () => {
    if (!priority) return 'bg-brand-500 dark:bg-brand-400';
    
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'bg-red-500 dark:bg-red-400';
      case NotificationPriority.HIGH:
        return 'bg-orange-500 dark:bg-orange-400';
      case NotificationPriority.MEDIUM:
        return 'bg-blue-500 dark:bg-blue-400';
      case NotificationPriority.LOW:
        return 'bg-gray-500 dark:bg-gray-400';
      default:
        return 'bg-brand-500 dark:bg-brand-400';
    }
  };

  // Format count (99+ for large numbers)
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <span
      className={`
        absolute -right-1 -top-1 z-10
        flex h-5 min-w-[20px] items-center justify-center
        rounded-full px-1
        text-[10px] font-semibold text-white
        ${getBadgeColor()}
        ${className}
      `}
    >
      {displayCount}
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${getBadgeColor()}" />
    </span>
  );
}
