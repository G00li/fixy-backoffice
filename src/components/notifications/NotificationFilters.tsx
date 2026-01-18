'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NotificationPriority } from '@/types/notifications';
import Button from '@/components/ui/button/Button';

interface NotificationFiltersProps {
  onMarkAllRead?: () => void;
  markingAllRead?: boolean;
}

export default function NotificationFilters({
  onMarkAllRead,
  markingAllRead = false,
}: NotificationFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPriority = searchParams.get('priority') || '';
  const currentType = searchParams.get('type') || '';
  const currentUnreadOnly = searchParams.get('unread') === 'true';

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/notifications?${params.toString()}`);
  };

  const handleUnreadToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (currentUnreadOnly) {
      params.delete('unread');
    } else {
      params.set('unread', 'true');
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/notifications?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push('/notifications');
  };

  const hasActiveFilters = currentPriority || currentType || currentUnreadOnly;

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Priority Filter */}
        <div className="flex-1">
          <label
            htmlFor="priority-filter"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Prioridade
          </label>
          <select
            id="priority-filter"
            value={currentPriority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
          >
            <option value="">Todas as Prioridades</option>
            <option value={NotificationPriority.LOW}>Baixa</option>
            <option value={NotificationPriority.MEDIUM}>Média</option>
            <option value={NotificationPriority.HIGH}>Alta</option>
            <option value={NotificationPriority.URGENT}>Urgente</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex-1">
          <label
            htmlFor="type-filter"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Tipo
          </label>
          <select
            id="type-filter"
            value={currentType}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500"
          >
            <option value="">Todos os Tipos</option>
            <option value="booking_status">Status de Agendamento</option>
            <option value="promo">Promoção</option>
            <option value="system">Sistema</option>
            <option value="user_action">Ação de Usuário</option>
            <option value="booking_update">Atualização de Agendamento</option>
            <option value="booking_attention">Atenção Necessária</option>
            <option value="campaign">Campanha</option>
            <option value="support_ticket">Ticket de Suporte</option>
            <option value="review">Avaliação</option>
            <option value="message">Mensagem</option>
            <option value="security_alert">Alerta de Segurança</option>
          </select>
        </div>

        {/* Unread Only Toggle */}
        <div className="flex items-end">
          <button
            onClick={handleUnreadToggle}
            className={`
              flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors
              ${
                currentUnreadOnly
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {currentUnreadOnly ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              )}
            </svg>
            Apenas não lidas
          </button>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearFilters}
              startIcon={
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
              }
            >
              Limpar Filtros
            </Button>
          )}
        </div>

        {onMarkAllRead && (
          <Button
            size="sm"
            variant="outline"
            onClick={onMarkAllRead}
            disabled={markingAllRead}
            startIcon={
              markingAllRead ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )
            }
          >
            {markingAllRead ? 'Marcando...' : 'Marcar Todas como Lidas'}
          </Button>
        )}
      </div>
    </div>
  );
}
