// Booking system types

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  service_id: string | null;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_price: number;
  service_fee: number;
  notes: string | null;
  address: BookingAddress | null;
  cancellation_reason: string | null;
  cancelled_by: 'client' | 'provider' | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  // Client info
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_avatar: string | null;
  // Service info
  service_title: string | null;
  service_duration: number | null;
  // Calculated
  duration_minutes: number;
  is_past: boolean;
  is_future: boolean;
}

export interface BookingAddress {
  street: string;
  number: string;
  complement?: string;
  postal_code: string;
  city: string;
  state: string;
  country: string;
}

export interface AvailableSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface BlockedTimeSlot {
  id: string;
  provider_id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  created_at: string;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval?: number;
  days_of_week?: number[]; // 0-6 (Sunday-Saturday)
  end_date?: string;
}

export interface AvailabilitySchedule {
  id: string;
  provider_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_active: boolean;
  created_at: string;
}

// Request/Response types

export interface CreateBookingParams {
  provider_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  address?: BookingAddress;
}

export interface CreateBookingResponse {
  booking_id: string | null;
  status: string;
  message: string;
}

export interface GetAvailableSlotsParams {
  provider_id: string;
  date: string; // YYYY-MM-DD
  service_id?: string;
}

export interface ApproveBookingResponse {
  success: boolean;
  message: string;
}

export interface RejectBookingParams {
  booking_id: string;
  reason?: string;
}

export interface CancelBookingParams {
  booking_id: string;
  reason?: string;
}

export interface BlockTimeSlotParams {
  start_time: string;
  end_time: string;
  reason?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
}

export interface BlockTimeSlotResponse {
  slot_id: string | null;
  success: boolean;
  message: string;
}

// Filter types

export interface BookingFilters {
  status?: BookingStatus | BookingStatus[];
  start_date?: string;
  end_date?: string;
  service_id?: string;
  search?: string;
}

// Calendar types

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'blocked' | 'available';
  status?: BookingStatus;
  data?: Booking | BlockedTimeSlot;
}

// Constants

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

export const DAY_OF_WEEK_SHORT_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

// Validation

export const BOOKING_VALIDATION = {
  MIN_DURATION_MINUTES: 15,
  MAX_DURATION_MINUTES: 480, // 8 hours
  MAX_NOTES_LENGTH: 500,
  MAX_CANCELLATION_REASON_LENGTH: 500,
} as const;
