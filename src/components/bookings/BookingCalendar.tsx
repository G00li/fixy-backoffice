'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BookingWithDetails, BOOKING_STATUS_COLORS } from '@/types/bookings';

interface BookingCalendarProps {
  bookings: BookingWithDetails[];
  onDateClick?: (date: Date) => void;
  onBookingClick?: (booking: BookingWithDetails) => void;
  className?: string;
}

export default function BookingCalendar({
  bookings,
  onDateClick,
  onBookingClick,
  className = '',
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.start_time);
      return isSameDay(bookingDate, date);
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Mês anterior"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Próximo mês"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayBookings = getBookingsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const hasBookings = dayBookings.length > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateClick?.(day)}
                className={`
                  relative min-h-[80px] p-2 rounded-lg border transition-all
                  ${
                    isCurrentMonth
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50'
                  }
                  ${isToday ? 'ring-2 ring-brand-500' : ''}
                  hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700
                `}
              >
                {/* Day Number */}
                <div
                  className={`
                    text-sm font-medium mb-1
                    ${
                      isToday
                        ? 'text-brand-600 dark:text-brand-400'
                        : isCurrentMonth
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-600'
                    }
                  `}
                >
                  {format(day, 'd')}
                </div>

                {/* Bookings Indicators */}
                {hasBookings && (
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <button
                        key={booking.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingClick?.(booking);
                        }}
                        className={`
                          w-full text-left px-1 py-0.5 rounded text-xs truncate
                          ${BOOKING_STATUS_COLORS[booking.status]}
                          hover:opacity-80 transition-opacity
                        `}
                        title={`${booking.service_title} - ${format(new Date(booking.start_time), 'HH:mm')}`}
                      >
                        {format(new Date(booking.start_time), 'HH:mm')}
                      </button>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{dayBookings.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Confirmado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Cancelado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
