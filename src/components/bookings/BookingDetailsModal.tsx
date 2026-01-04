'use client';

import { BookingWithDetails, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/types/bookings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

interface BookingDetailsModalProps {
  booking: BookingWithDetails;
  isProvider?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string, reason?: string) => void;
  onCancel?: (bookingId: string, reason?: string) => void;
  onComplete?: (bookingId: string) => void;
}

export default function BookingDetailsModal({
  booking,
  isProvider = false,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onCancel,
  onComplete,
}: BookingDetailsModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  const isPast = booking.is_past;
  const isFuture = booking.is_future;

  const canApprove = isProvider && booking.status === 'pending';
  const canReject = isProvider && booking.status === 'pending';
  const canCancel = ['pending', 'confirmed'].includes(booking.status) && isFuture;
  const canComplete = isProvider && booking.status === 'confirmed' && isPast;

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    await onApprove(booking.id);
    setIsProcessing(false);
    onClose();
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsProcessing(true);
    await onReject(booking.id, rejectReason || undefined);
    setIsProcessing(false);
    setShowRejectForm(false);
    onClose();
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setIsProcessing(true);
    await onCancel(booking.id, cancelReason || undefined);
    setIsProcessing(false);
    setShowCancelForm(false);
    onClose();
  };

  const handleComplete = async () => {
    if (!onComplete) return;
    setIsProcessing(true);
    await onComplete(booking.id);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detalhes do Agendamento
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span
                className={`
                  inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                  ${BOOKING_STATUS_COLORS[booking.status]}
                `}
              >
                {BOOKING_STATUS_LABELS[booking.status]}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ID: {booking.id.slice(0, 8)}...
              </span>
            </div>

            {/* Service Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Serviço
              </h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {booking.service_title || 'Serviço'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>⏱️ {booking.duration_minutes} min</span>
                <span>💰 €{booking.total_price.toFixed(2)}</span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Data e Horário
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-900 dark:text-white">
                    {format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                  <span className="text-gray-900 dark:text-white">
                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>

            {/* Client/Provider Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {isProvider ? 'Cliente' : 'Provider'}
              </h3>
              <div className="flex items-center gap-3">
                {booking.client_avatar && (
                  <img
                    src={booking.client_avatar}
                    alt={booking.client_name || 'Cliente'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {booking.client_name || 'Cliente'}
                  </p>
                  {booking.client_email && (
                    <a
                      href={`mailto:${booking.client_email}`}
                      className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      {booking.client_email}
                    </a>
                  )}
                  {booking.client_phone && (
                    <a
                      href={`tel:${booking.client_phone}`}
                      className="block text-sm text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      {booking.client_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Notas do Cliente
                </h3>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {booking.notes}
                </p>
              </div>
            )}

            {/* Cancellation Info */}
            {booking.status === 'cancelled' && booking.cancellation_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Motivo do Cancelamento
                </h3>
                <p className="text-red-700 dark:text-red-300">{booking.cancellation_reason}</p>
                {booking.cancelled_by && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Cancelado por: {booking.cancelled_by === 'client' ? 'Cliente' : 'Provider'}
                  </p>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Criado em: {format(new Date(booking.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              <p>Atualizado em: {format(new Date(booking.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>

            {/* Reject Form */}
            {showRejectForm && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Motivo da Recusa
                </h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explique o motivo da recusa..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirmar Recusa
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Form */}
            {showCancelForm && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Motivo do Cancelamento
                </h3>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explique o motivo do cancelamento..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setShowCancelForm(false)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isProcessing}
                    className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirmar Cancelamento
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          {!showRejectForm && !showCancelForm && (
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {canApprove && onApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Aprovar
                  </button>
                )}

                {canReject && onReject && (
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Recusar
                  </button>
                )}

                {canComplete && onComplete && (
                  <button
                    onClick={handleComplete}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Concluir
                  </button>
                )}

                {canCancel && onCancel && (
                  <button
                    onClick={() => setShowCancelForm(true)}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
