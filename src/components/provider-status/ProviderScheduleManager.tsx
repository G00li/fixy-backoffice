'use client';

import { useState, useEffect } from 'react';
import { CalenderIcon, TimeIcon, TrashBinIcon, PlusIcon } from '@/icons';
import { showToast, toastMessages } from '@/lib/toast';
import {
  ProviderSchedule,
  DAY_LABELS,
  DAY_SHORT_LABELS,
} from '@/types/provider-status';
import {
  getProviderSchedule,
  setProviderSchedule,
  deleteProviderSchedule,
  toggleAutoStatus,
  getProviderSettings,
} from '@/app/actions/provider-status';

interface ProviderScheduleManagerProps {
  providerId: string;
  isOwner?: boolean;
  onScheduleChange?: () => void;
  className?: string;
}

export default function ProviderScheduleManager({
  providerId,
  isOwner = false,
  onScheduleChange,
  className = '',
}: ProviderScheduleManagerProps) {
  const [schedule, setSchedule] = useState<ProviderSchedule[]>([]);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state for adding/editing
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');

  // Load schedule and settings
  useEffect(() => {
    const loadData = async () => {
      const [scheduleResult, settingsResult] = await Promise.all([
        getProviderSchedule(providerId),
        getProviderSettings(providerId),
      ]);

      if (scheduleResult.success && scheduleResult.schedule) {
        setSchedule(scheduleResult.schedule);
      }

      if (settingsResult.success && settingsResult.settings) {
        setAutoEnabled(settingsResult.settings.auto_status_enabled);
      }

      setLoading(false);
    };

    loadData();
  }, [providerId]);

  // Handle toggle auto status
  const handleToggleAuto = async () => {
    setSaving(true);
    const toastId = showToast.loading('Atualizando modo automático...');
    
    try {
      const result = await toggleAutoStatus(!autoEnabled);
      if (result.success) {
        setAutoEnabled(!autoEnabled);
        onScheduleChange?.();
        showToast.dismiss(toastId);
        showToast.success(`Modo automático ${!autoEnabled ? 'ativado' : 'desativado'}`);
      } else {
        showToast.dismiss(toastId);
        showToast.error(result.error || 'Erro ao alterar modo automático');
      }
    } catch (error) {
      console.error('Error toggling auto status:', error);
      showToast.dismiss(toastId);
      showToast.error('Erro inesperado');
    } finally {
      setSaving(false);
    }
  };

  // Handle save schedule
  const handleSaveSchedule = async () => {
    if (editingDay === null) return;

    // Validate times
    if (closeTime <= openTime) {
      showToast.error('Horário de fechamento deve ser após o de abertura');
      return;
    }

    setSaving(true);
    const toastId = showToast.loading('Salvando horário...');
    
    try {
      const result = await setProviderSchedule({
        day_of_week: editingDay,
        open_time: openTime,
        close_time: closeTime,
        is_active: true,
      });

      if (result.success && result.schedule) {
        // Update schedule list
        setSchedule((prev) => {
          const filtered = prev.filter((s) => s.day_of_week !== editingDay);
          return [...filtered, result.schedule!].sort((a, b) => a.day_of_week - b.day_of_week);
        });
        
        setEditingDay(null);
        setOpenTime('09:00');
        setCloseTime('18:00');
        onScheduleChange?.();
        showToast.dismiss(toastId);
        showToast.success(toastMessages.schedule.saved);
      } else {
        showToast.dismiss(toastId);
        showToast.error(result.error || toastMessages.schedule.saveError);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      showToast.dismiss(toastId);
      showToast.error(toastMessages.schedule.saveError);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (dayOfWeek: number) => {
    if (!confirm(`Remover horário de ${DAY_LABELS[dayOfWeek]}?`)) return;

    setSaving(true);
    const toastId = showToast.loading('Removendo horário...');
    
    try {
      const result = await deleteProviderSchedule(dayOfWeek);
      if (result.success) {
        setSchedule((prev) => prev.filter((s) => s.day_of_week !== dayOfWeek));
        onScheduleChange?.();
        showToast.dismiss(toastId);
        showToast.success(toastMessages.schedule.deleted);
      } else {
        showToast.dismiss(toastId);
        showToast.error(result.error || toastMessages.schedule.deleteError);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      showToast.dismiss(toastId);
      showToast.error(toastMessages.schedule.deleteError);
    } finally {
      setSaving(false);
    }
  };

  // Handle edit schedule
  const handleEditSchedule = (daySchedule: ProviderSchedule) => {
    setEditingDay(daySchedule.day_of_week);
    setOpenTime(daySchedule.open_time);
    setCloseTime(daySchedule.close_time);
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-96 ${className}`} />
    );
  }

  // Get days without schedule
  const scheduledDays = schedule.map((s) => s.day_of_week);
  const availableDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => !scheduledDays.includes(d));

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalenderIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Horários de Funcionamento
            </h3>
          </div>

          {/* Auto Status Toggle */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Modo Automático
              </span>
              <button
                onClick={handleToggleAuto}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${autoEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${autoEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          )}
        </div>

        {autoEnabled && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            ✓ Status será alterado automaticamente conforme horários configurados
          </p>
        )}
      </div>

      {/* Schedule List */}
      <div className="p-4 space-y-2">
        {schedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CalenderIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum horário configurado</p>
            {isOwner && (
              <p className="text-sm mt-1">Adicione horários para habilitar o modo automático</p>
            )}
          </div>
        ) : (
          schedule.map((daySchedule) => (
            <div
              key={daySchedule.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 text-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {DAY_SHORT_LABELS[daySchedule.day_of_week]}
                  </span>
                </div>
                <TimeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {daySchedule.open_time} - {daySchedule.close_time}
                </span>
              </div>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditSchedule(daySchedule)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(daySchedule.day_of_week)}
                    disabled={saving}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <TrashBinIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form */}
      {isOwner && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {editingDay === null ? (
            // Add new schedule
            availableDays.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adicionar Horário
                </label>
                <select
                  onChange={(e) => setEditingDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um dia</option>
                  {availableDays.map((day) => (
                    <option key={day} value={day}>
                      {DAY_LABELS[day]}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Todos os dias já têm horários configurados
              </p>
            )
          ) : (
            // Edit form
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {DAY_LABELS[editingDay]}
                </label>
                <button
                  onClick={() => {
                    setEditingDay(null);
                    setOpenTime('09:00');
                    setCloseTime('18:00');
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Abertura
                  </label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Fechamento
                  </label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2
                         bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                         text-white font-medium rounded-lg transition-colors
                         disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    <span>Salvar Horário</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
