'use client';

import { useState } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BlockTimeSlotParams, RecurrencePattern } from '@/types/bookings';
import { blockTimeSlot } from '@/app/actions/bookings';

interface BlockTimeSlotFormProps {
  onSuccess?: (slotId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export default function BlockTimeSlotForm({
  onSuccess,
  onCancel,
  className = '',
}: BlockTimeSlotFormProps) {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    format(addDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
  ];

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    const start = new Date(`${startDate}T${startTime}:00Z`);
    const end = new Date(`${endDate}T${endTime}:00Z`);

    if (end <= start) {
      setError('A data/hora de fim deve ser posterior à de início');
      return;
    }

    if (isRecurring && recurrenceType === 'weekly' && selectedDays.length === 0) {
      setError('Selecione pelo menos um dia da semana para recorrência');
      return;
    }

    setIsSubmitting(true);

    const recurrencePattern: RecurrencePattern | undefined = isRecurring
      ? {
          type: recurrenceType,
          days_of_week: recurrenceType === 'weekly' ? selectedDays : undefined,
          end_date: recurrenceEndDate,
        }
      : undefined;

    const params: BlockTimeSlotParams = {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      reason: reason || undefined,
      is_recurring: isRecurring,
      recurrence_pattern: recurrencePattern,
    };

    const result = await blockTimeSlot(params);

    setIsSubmitting(false);

    if (result.success && result.slot_id) {
      onSuccess?.(result.slot_id);
    } else {
      setError(result.error || 'Erro ao bloquear horário');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Bloquear Horário
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Start Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data de Início
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            required
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hora de Início
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* End Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data de Fim
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            required
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hora de Fim
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Reason */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Motivo (opcional)
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Selecione um motivo</option>
          <option value="Férias">Férias</option>
          <option value="Compromisso pessoal">Compromisso pessoal</option>
          <option value="Manutenção">Manutenção</option>
          <option value="Treinamento">Treinamento</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      {/* Recurring */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Repetir bloqueio
          </span>
        </label>
      </div>

      {/* Recurrence Options */}
      {isRecurring && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
          {/* Recurrence Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Recorrência
            </label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="daily">Diariamente</option>
              <option value="weekly">Semanalmente</option>
              <option value="monthly">Mensalmente</option>
            </select>
          </div>

          {/* Days of Week (for weekly) */}
          {recurrenceType === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dias da Semana
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        selectedDays.includes(day.value)
                          ? 'bg-brand-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                      }
                    `}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recurrence End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repetir até
            </label>
            <input
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
              min={startDate}
              required
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Bloqueando...
            </>
          ) : (
            'Bloquear Horário'
          )}
        </button>
      </div>
    </form>
  );
}
