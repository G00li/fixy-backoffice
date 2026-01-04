'use client';

import { useState } from 'react';
import { AvailableSlot } from '@/types/bookings';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AvailableSlotsListProps {
  slots: AvailableSlot[];
  selectedSlot?: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
  isLoading?: boolean;
  className?: string;
}

export default function AvailableSlotsList({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
  className = '',
}: AvailableSlotsListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter only available slots
  const availableSlots = slots.filter((slot) => slot.is_available);

  // Group slots by period (morning, afternoon, evening)
  const groupSlotsByPeriod = (slots: AvailableSlot[]) => {
    const morning: AvailableSlot[] = [];
    const afternoon: AvailableSlot[] = [];
    const evening: AvailableSlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.start_time.split(':')[0]);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 18) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupSlotsByPeriod(availableSlots);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando horários...</span>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Nenhum horário disponível
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tente selecionar outra data
        </p>
      </div>
    );
  }

  const SlotButton = ({ slot }: { slot: AvailableSlot }) => {
    const isSelected =
      selectedSlot?.start_time === slot.start_time && selectedSlot?.end_time === slot.end_time;

    return (
      <button
        onClick={() => onSelectSlot(slot)}
        className={`
          px-4 py-3 rounded-lg border-2 transition-all
          ${
            isSelected
              ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10'
          }
        `}
      >
        <div className="text-sm font-medium">
          {slot.start_time} - {slot.end_time}
        </div>
      </button>
    );
  };

  const PeriodSection = ({ title, slots, icon }: { title: string; slots: AvailableSlot[]; icon: string }) => {
    if (slots.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title} ({slots.length})
          </h3>
        </div>
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3' : 'space-y-2'}>
          {slots.map((slot, index) => (
            <SlotButton key={`${slot.start_time}-${index}`} slot={slot} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Horários Disponíveis
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {availableSlots.length} {availableSlots.length === 1 ? 'horário' : 'horários'} disponível
            {availableSlots.length !== 1 ? 'is' : ''}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title="Visualização em grade"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title="Visualização em lista"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Slots by Period */}
      <div>
        <PeriodSection title="Manhã" slots={morning} icon="🌅" />
        <PeriodSection title="Tarde" slots={afternoon} icon="☀️" />
        <PeriodSection title="Noite" slots={evening} icon="🌙" />
      </div>

      {/* Selected Slot Info */}
      {selectedSlot && (
        <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-brand-600 dark:text-brand-400"
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
            <div>
              <p className="text-sm font-medium text-brand-900 dark:text-brand-100">
                Horário selecionado
              </p>
              <p className="text-sm text-brand-700 dark:text-brand-300">
                {selectedSlot.start_time} - {selectedSlot.end_time}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
