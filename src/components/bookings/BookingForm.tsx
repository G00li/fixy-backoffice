'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AvailableSlot, CreateBookingParams, BOOKING_VALIDATION } from '@/types/bookings';
import { getAvailableSlots, createBooking } from '@/app/actions/bookings';
import AvailableSlotsList from './AvailableSlotsList';

interface Service {
  id: string;
  title: string;
  duration_min: number;
  price: number;
}

interface BookingFormProps {
  providerId: string;
  services: Service[];
  onSuccess?: (bookingId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export default function BookingForm({
  providerId,
  services,
  onSuccess,
  onCancel,
  className = '',
}: BookingFormProps) {
  const [step, setStep] = useState<'service' | 'datetime' | 'details' | 'confirm'>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available slots when service or date changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedService, selectedDate]);

  const loadAvailableSlots = async () => {
    if (!selectedService) return;

    setIsLoadingSlots(true);
    setError(null);
    setSelectedSlot(null);

    const result = await getAvailableSlots({
      provider_id: providerId,
      date: selectedDate,
      service_id: selectedService.id,
    });

    setIsLoadingSlots(false);

    if (result.success && result.slots) {
      setAvailableSlots(result.slots);
    } else {
      setError(result.error || 'Erro ao carregar horários');
      setAvailableSlots([]);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
  };

  const handleContinueToDetails = () => {
    if (!selectedSlot) {
      setError('Selecione um horário');
      return;
    }
    setStep('details');
  };

  const handleContinueToConfirm = () => {
    if (notes.length > BOOKING_VALIDATION.MAX_NOTES_LENGTH) {
      setError(`Notas muito longas (máximo ${BOOKING_VALIDATION.MAX_NOTES_LENGTH} caracteres)`);
      return;
    }
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedSlot) {
      setError('Dados incompletos');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Build start_time and end_time
    const startTime = `${selectedDate}T${selectedSlot.start_time}:00Z`;
    const endTime = `${selectedDate}T${selectedSlot.end_time}:00Z`;

    const params: CreateBookingParams = {
      provider_id: providerId,
      service_id: selectedService.id,
      start_time: startTime,
      end_time: endTime,
      notes: notes || undefined,
    };

    const result = await createBooking(params);

    setIsSubmitting(false);

    if (result.success && result.booking_id) {
      onSuccess?.(result.booking_id);
    } else {
      setError(result.error || 'Erro ao criar agendamento');
    }
  };

  // Generate next 30 days for date selection
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i + 1);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, "EEEE, d 'de' MMMM", { locale: ptBR }),
      shortLabel: format(date, 'd MMM', { locale: ptBR }),
    };
  });

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Progress Steps */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {['service', 'datetime', 'details', 'confirm'].map((s, index) => {
            const stepLabels = {
              service: 'Serviço',
              datetime: 'Data/Hora',
              details: 'Detalhes',
              confirm: 'Confirmar',
            };
            const isActive = step === s;
            const isCompleted = ['service', 'datetime', 'details', 'confirm'].indexOf(step) > index;

            return (
              <div key={s} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {stepLabels[s as keyof typeof stepLabels]}
                </span>
                {index < 3 && (
                  <div className="w-8 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 'service' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Selecione o Serviço
            </h2>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>⏱️ {service.duration_min} min</span>
                    <span>💰 €{service.price.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 'datetime' && selectedService && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Selecione Data e Horário
            </h2>

            {/* Selected Service Info */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Serviço selecionado:</p>
              <p className="font-semibold text-gray-900 dark:text-white">{selectedService.title}</p>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {availableDates.map((date) => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Available Slots */}
            <AvailableSlotsList
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSlotSelect}
              isLoading={isLoadingSlots}
            />

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('service')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleContinueToDetails}
                disabled={!selectedSlot}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 'details' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Informações Adicionais
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva detalhes sobre o serviço que precisa..."
                rows={4}
                maxLength={BOOKING_VALIDATION.MAX_NOTES_LENGTH}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {notes.length}/{BOOKING_VALIDATION.MAX_NOTES_LENGTH} caracteres
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('datetime')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleContinueToConfirm}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && selectedService && selectedSlot && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar Agendamento
            </h2>

            <div className="space-y-4 mb-6">
              {/* Service */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Serviço</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedService.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  €{selectedService.price.toFixed(2)} • {selectedService.duration_min} min
                </p>
              </div>

              {/* Date & Time */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Data e Horário</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedSlot.start_time} - {selectedSlot.end_time}
                </p>
              </div>

              {/* Notes */}
              {notes && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notas</p>
                  <p className="text-gray-900 dark:text-white">{notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Criando...
                  </>
                ) : (
                  'Confirmar Agendamento'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {onCancel && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
