'use client';

import { useEffect, useState } from 'react';
import { TimeIcon } from '@/icons';
import { ProviderStatus, STATUS_INDICATOR_COLORS } from '@/types/provider-status';
import StatusBadge from './StatusBadge';
import { getProviderStatus } from '@/app/actions/provider-status';

interface ProviderStatusWidgetProps {
  providerId: string;
  showMessage?: boolean;
  showLastUpdate?: boolean;
  className?: string;
}

export default function ProviderStatusWidget({
  providerId,
  showMessage = true,
  showLastUpdate = true,
  className = '',
}: ProviderStatusWidgetProps) {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      const result = await getProviderStatus(providerId);
      if (result.success && result.status) {
        setStatus(result.status);
      }
      setLoading(false);
    };

    loadStatus();
  }, [providerId]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-20 ${className}`} />
    );
  }

  if (!status) {
    return null;
  }

  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays}d`;
  };

  const formatAutoClose = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div
            className={`w-3 h-3 rounded-full ${STATUS_INDICATOR_COLORS[status.status_type]}`}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status Atual
          </span>
        </div>

        {/* Status Badge */}
        <StatusBadge statusType={status.status_type} size="sm" />
      </div>

      {/* Status Message */}
      {showMessage && status.status_message && (
        <div className="flex items-start gap-2 mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-blue-900 dark:text-blue-100">
            {status.status_message}
          </p>
        </div>
      )}

      {/* Auto-close Info */}
      {status.auto_close_at && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <TimeIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            Fecha automaticamente às {formatAutoClose(status.auto_close_at)}
          </p>
        </div>
      )}

      {/* Last Update */}
      {showLastUpdate && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Atualizado {formatLastUpdate(status.updated_at)}
        </div>
      )}
    </div>
  );
}
