'use client';

import { BookingWithDetails, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/types/bookings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingCardProps {
  booking: BookingWithDetails;
  isProvider?: boolean;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onComplete?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  className?: string;
}

export default function BookingCard({
  booking,
  isProvider = false,
  onApprove,
  onReject,
  onCancel,
  onComplete,
  onViewDetails,
  className = '',
}: BookingCardProps) {
  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  const isPast = booking.is_past;
  const isFuture = booking.is_future;

  const canApprove = isProvider && booking.status === 'pending';
  const canReject = isProvider && booking.status === 'pending';
  const canCancel = (isProvider || !isProvider) && ['pending', 'confirmed'].includes(booking.status) && isFuture;
  const canComplete = isProvider && booking.status === 'confirmed' && isPast;

  return (
    <div
      className={`
        rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800 p-4 sm:p-6
        hover:shadow-md transition-shadow
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          {/* Service Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {booking.service_title || 'Serviço'}
          </h3>

          {/* Client/Provider Info */}
          <div className="flex items-center gap-2 mt-1">
            {booking.client_avatar && (
              <img
                src={booking.client_avatar}
                alt={booking.client_name || 'Cliente'}
                className="w-6 h-6 rounded-full"
              />
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isProvider ? booking.client_name : 'Provider Name'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${BOOKING_STATUS_COLORS[booking.status]}
          `}
        >
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      </div>

      {/* Date and Time */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
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
          <span className="text-gray-700 dark:text-gray-300">
            {format(startDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
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
          <span className="text-gray-700 dark:text-gray-300">
            {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            ({booking.duration_minutes} min)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 text-sm">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold text-gray-900 dark:text-white">
            €{booking.total_price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Notas:</span> {booking.notes}
          </p>
        </div>
      )}

      {/* Cancellation Reason */}
      {booking.status === 'cancelled' && booking.cancellation_reason && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            <span className="font-medium">Motivo do cancelamento:</span>{' '}
            {booking.cancellation_reason}
          </p>
          {booking.cancelled_by && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              Cancelado por: {booking.cancelled_by === 'client' ? 'Cliente' : 'Provider'}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {/* View Details */}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(booking.id)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Detalhes
          </button>
        )}

        {/* Approve */}
        {canApprove && onApprove && (
          <button
            onClick={() => onApprove(booking.id)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Aprovar
          </button>
        )}

        {/* Reject */}
        {canReject && onReject && (
          <button
            onClick={() => onReject(booking.id)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Recusar
          </button>
        )}

        {/* Complete */}
        {canComplete && onComplete && (
          <button
            onClick={() => onComplete(booking.id)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Concluir
          </button>
        )}

        {/* Cancel */}
        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancelar
          </button>
        )}
      </div>

      {/* Contact Info (for providers) */}
      {isProvider && booking.client_email && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Contato do cliente:</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {booking.client_email && (
              <a
                href={`mailto:${booking.client_email}`}
                className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {booking.client_email}
              </a>
            )}
            {booking.client_phone && (
              <a
                href={`tel:${booking.client_phone}`}
                className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {booking.client_phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
