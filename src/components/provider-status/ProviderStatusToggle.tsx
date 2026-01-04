'use client';

import { useState, useEffect } from 'react';
import { TimeIcon } from '@/icons';
import { showToast, toastMessages } from '@/lib/toast';
import {
  StatusType,
  STATUS_TYPE_LABELS,
  AUTO_CLOSE_OPTIONS,
  STATUS_VALIDATION,
} from '@/types/provider-status';
import {
  toggleProviderStatus,
  updateProviderStatus,
  getProviderStatus,
} from '@/app/actions/provider-status';
import StatusBadge from './StatusBadge';

interface ProviderStatusToggleProps {
  providerId: string;
  onStatusChange?: () => void;
  className?: string;
}

export default function ProviderStatusToggle({
  providerId,
  onStatusChange,
  className = '',
}: ProviderStatusToggleProps) {
  const [currentStatus, setCurrentStatus] = useState<StatusType>('closed');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Form state
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('open');
  const [statusMessage, setStatusMessage] = useState('');
  const [autoCloseHours, setAutoCloseHours] = useState<number | null>(null);

  // Load current status
  useEffect(() => {
    const loadStatus = async () => {
      const result = await getProviderStatus(providerId);
      if (result.success && result.status) {
        setCurrentStatus(result.status.status_type);
        setIsOpen(result.status.is_open);
      }
      setLoading(false);
    };

    loadStatus();
  }, [providerId]);

  // Quick toggle (open ↔ closed)
  const handleQuickToggle = async () => {
    setUpdating(true);
    const toastId = showToast.loading('Alternando status...');
    
    try {
      const result = await toggleProviderStatus();
      
      if (result.success && result.status) {
        setCurrentStatus(result.status.status_type);
        setIsOpen(result.status.is_open);
        onStatusChange?.();
        showToast.dismiss(toastId);
        showToast.success(toastMessages.status.updated);
      } else {
        showToast.dismiss(toastId);
        showToast.error(result.error || toastMessages.status.updateError);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast.dismiss(toastId);
      showToast.error(toastMessages.status.updateError);
    } finally {
      setUpdating(false);
    }
  };

  // Update status with full control
  const handleUpdateStatus = async () => {
    // Validate message length
    if (statusMessage.length > STATUS_VALIDATION.MAX_MESSAGE_LENGTH) {
      showToast.error(`Mensagem deve ter no máximo ${STATUS_VALIDATION.MAX_MESSAGE_LENGTH} caracteres`);
      return;
    }

    setUpdating(true);
    const toastId = showToast.loading('Atualizando status...');
    
    try {
      const result = await updateProviderStatus({
        status_type: selectedStatus,
        status_message: statusMessage || undefined,
        auto_close_hours: autoCloseHours || undefined,
      });

      if (result.success && result.status) {
        setCurrentStatus(result.status.status_type);
        setIsOpen(result.status.is_open);
        setStatusMessage('');
        setAutoCloseHours(null);
        onStatusChange?.();
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
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64 ${className}`} />
    );
  }

  const statusOptions: StatusType[] = ['open', 'closed', 'busy', 'emergency_only'];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Controle de Status
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Status atual: <StatusBadge statusType={currentStatus} size="sm" />
            </p>
          </div>

          {/* Quick Toggle Button */}
          <button
            onClick={handleQuickToggle}
            disabled={updating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${
                isOpen
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {updating ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            <span>{isOpen ? 'Fechar' : 'Abrir'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="p-4 space-y-4">
        {/* Status Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {STATUS_TYPE_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Status Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Mensagem Personalizada (opcional)
          </label>
          <textarea
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            placeholder="Ex: Atendendo até 18h"
            maxLength={STATUS_VALIDATION.MAX_MESSAGE_LENGTH}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {statusMessage.length}/{STATUS_VALIDATION.MAX_MESSAGE_LENGTH} caracteres
          </p>
        </div>

        {/* Auto-close */}
        {selectedStatus !== 'closed' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <TimeIcon className="inline h-4 w-4 mr-1" />
              Fechar Automaticamente
            </label>
            <select
              value={autoCloseHours || ''}
              onChange={(e) => setAutoCloseHours(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Não fechar automaticamente</option>
              {AUTO_CLOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Update Button */}
        <button
          onClick={handleUpdateStatus}
          disabled={updating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                   text-white font-medium rounded-lg transition-colors
                   disabled:cursor-not-allowed"
        >
          {updating ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Atualizando...</span>
            </>
          ) : (
            <span>Atualizar Status</span>
          )}
        </button>
      </div>
    </div>
  );
}
