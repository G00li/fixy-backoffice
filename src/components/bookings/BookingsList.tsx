'use client';

import { useState } from 'react';
import { BookingWithDetails, BookingStatus, BOOKING_STATUS_LABELS } from '@/types/bookings';
import BookingCard from './BookingCard';

interface BookingsListProps {
  bookings: BookingWithDetails[];
  isProvider?: boolean;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onComplete?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  className?: string;
}

export default function BookingsList({
  bookings,
  isProvider = false,
  onApprove,
  onReject,
  onCancel,
  onComplete,
  onViewDetails,
  className = '',
}: BookingsListProps) {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.service_title?.toLowerCase().includes(query) ||
        booking.client_name?.toLowerCase().includes(query) ||
        booking.client_email?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Group bookings by status
  const pendingBookings = filteredBookings.filter((b) => b.status === 'pending');
  const confirmedBookings = filteredBookings.filter((b) => b.status === 'confirmed');
  const completedBookings = filteredBookings.filter((b) => b.status === 'completed');
  const cancelledBookings = filteredBookings.filter((b) => b.status === 'cancelled');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar agendamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="pending">{BOOKING_STATUS_LABELS.pending}</option>
            <option value="confirmed">{BOOKING_STATUS_LABELS.confirmed}</option>
            <option value="completed">{BOOKING_STATUS_LABELS.completed}</option>
            <option value="cancelled">{BOOKING_STATUS_LABELS.cancelled}</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredBookings.length} {filteredBookings.length === 1 ? 'agendamento' : 'agendamentos'}
          {searchQuery && ' encontrado(s)'}
        </p>
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Nenhum agendamento encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'Tente ajustar os filtros de busca'
              : 'Você ainda não tem agendamentos'}
          </p>
        </div>
      )}

      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (statusFilter === 'all' || statusFilter === 'pending') && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pendentes ({pendingBookings.length})
          </h3>
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isProvider={isProvider}
                onApprove={onApprove}
                onReject={onReject}
                onCancel={onCancel}
                onComplete={onComplete}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Bookings */}
      {confirmedBookings.length > 0 && (statusFilter === 'all' || statusFilter === 'confirmed') && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Confirmados ({confirmedBookings.length})
          </h3>
          <div className="space-y-4">
            {confirmedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isProvider={isProvider}
                onApprove={onApprove}
                onReject={onReject}
                onCancel={onCancel}
                onComplete={onComplete}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Bookings */}
      {completedBookings.length > 0 && (statusFilter === 'all' || statusFilter === 'completed') && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Concluídos ({completedBookings.length})
          </h3>
          <div className="space-y-4">
            {completedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isProvider={isProvider}
                onApprove={onApprove}
                onReject={onReject}
                onCancel={onCancel}
                onComplete={onComplete}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Bookings */}
      {cancelledBookings.length > 0 && (statusFilter === 'all' || statusFilter === 'cancelled') && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cancelados ({cancelledBookings.length})
          </h3>
          <div className="space-y-4">
            {cancelledBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isProvider={isProvider}
                onApprove={onApprove}
                onReject={onReject}
                onCancel={onCancel}
                onComplete={onComplete}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
