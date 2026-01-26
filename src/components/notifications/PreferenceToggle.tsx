'use client';

import React, { useState } from 'react';
import { NotificationPreference, NotificationChannel } from '@/types/notifications';

interface PreferenceToggleProps {
  preference: NotificationPreference;
  onUpdate: (updates: Partial<NotificationPreference>) => Promise<void>;
  updating: boolean;
}

export default function PreferenceToggle({
  preference,
  onUpdate,
  updating,
}: PreferenceToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      booking_status: 'Status de Agendamento',
      promo: 'Promoções',
      system: 'Sistema',
      user_action: 'Ação de Usuário',
      booking_update: 'Atualização de Agendamento',
      booking_attention: 'Atenção Necessária',
      campaign: 'Campanhas',
      support_ticket: 'Tickets de Suporte',
      review: 'Avaliações',
      message: 'Mensagens',
      security_alert: 'Alertas de Segurança',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      booking_status: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      promo: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      system: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      security_alert: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      message: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    };
    return icons[type] || (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  };

  const handleToggleEnabled = async () => {
    await onUpdate({ enabled: !preference.enabled });
  };

  const handleChannelToggle = async (channel: NotificationChannel) => {
    const currentChannels = preference.channels || [];
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];
    
    await onUpdate({ channels: newChannels });
  };

  const handleQuietHoursChange = async (start: string | null, end: string | null) => {
    await onUpdate({
      quiet_hours_start: start,
      quiet_hours_end: end,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 rounded-lg ${
            preference.enabled
              ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
          }`}>
            {getTypeIcon(preference.notification_type)}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {getTypeLabel(preference.notification_type)}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {preference.enabled ? 'Ativo' : 'Desativado'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Switch */}
          <button
            onClick={handleToggleEnabled}
            disabled={updating}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${preference.enabled ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}
            `}
            aria-label={`Toggle ${getTypeLabel(preference.notification_type)}`}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${preference.enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!preference.enabled}
            className={`
              p-1 rounded transition-colors
              ${preference.enabled
                ? 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
              }
            `}
            aria-label="Expandir detalhes"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && preference.enabled && (
        <div className="border-t border-gray-200 p-4 space-y-4 dark:border-gray-700">
          {/* Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Canais de Notificação
            </label>
            <div className="space-y-2">
              {/* In-App */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preference.channels?.includes(NotificationChannel.IN_APP) || false}
                  onChange={() => handleChannelToggle(NotificationChannel.IN_APP)}
                  disabled={updating}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  In-App (Notificações no aplicativo)
                </span>
              </label>

              {/* Email */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preference.channels?.includes(NotificationChannel.EMAIL) || false}
                  onChange={() => handleChannelToggle(NotificationChannel.EMAIL)}
                  disabled={updating}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Email
                </span>
              </label>

              {/* Push */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preference.channels?.includes(NotificationChannel.PUSH) || false}
                  onChange={() => handleChannelToggle(NotificationChannel.PUSH)}
                  disabled={updating}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Push (Notificações push)
                </span>
              </label>
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Horário de Silêncio (Opcional)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="time"
                  value={preference.quiet_hours_start || ''}
                  onChange={(e) => handleQuietHoursChange(
                    e.target.value || null,
                    preference.quiet_hours_end
                  )}
                  disabled={updating}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Início"
                />
              </div>
              <span className="text-gray-500 dark:text-gray-400">até</span>
              <div className="flex-1">
                <input
                  type="time"
                  value={preference.quiet_hours_end || ''}
                  onChange={(e) => handleQuietHoursChange(
                    preference.quiet_hours_start,
                    e.target.value || null
                  )}
                  disabled={updating}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Fim"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Durante este período, você não receberá notificações
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
