// Provider status and schedule types

export type StatusType = 'open' | 'closed' | 'busy' | 'emergency_only';

export interface ProviderStatus {
  provider_id: string;
  is_open: boolean;
  status_type: StatusType;
  status_message: string | null;
  auto_close_at: string | null;
  updated_at: string;
}

export interface ProviderSchedule {
  id: string;
  provider_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  open_time: string; // HH:MM format
  close_time: string; // HH:MM format
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderSettings {
  provider_id: string;
  auto_status_enabled: boolean;
  timezone: string;
  // ... other settings
}

// Update status params
export interface UpdateStatusParams {
  status_type: StatusType;
  status_message?: string;
  auto_close_hours?: number;
}

// Set schedule params
export interface SetScheduleParams {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_active?: boolean;
}

// Validation constants
export const STATUS_VALIDATION = {
  MAX_MESSAGE_LENGTH: 200,
  MIN_AUTO_CLOSE_HOURS: 1,
  MAX_AUTO_CLOSE_HOURS: 24,
} as const;

// Day of week labels
export const DAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

// Day of week short labels
export const DAY_SHORT_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

// Status type labels (reuse from search.ts if needed)
export const STATUS_TYPE_LABELS: Record<StatusType, string> = {
  open: 'Aberto',
  closed: 'Fechado',
  busy: 'Ocupado',
  emergency_only: 'Apenas Emergências',
};

// Status type colors
export const STATUS_TYPE_COLORS: Record<StatusType, string> = {
  open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  busy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  emergency_only: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

// Status indicator colors (for dot/circle)
export const STATUS_INDICATOR_COLORS: Record<StatusType, string> = {
  open: 'bg-green-500',
  closed: 'bg-gray-400',
  busy: 'bg-yellow-500',
  emergency_only: 'bg-blue-500',
};

// Timezone options (common timezones)
export const TIMEZONE_OPTIONS = [
  { value: 'Europe/Lisbon', label: 'Lisboa (GMT+0/+1)' },
  { value: 'Europe/London', label: 'Londres (GMT+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1/+2)' },
  { value: 'Europe/Berlin', label: 'Berlim (GMT+1/+2)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'Nova York (GMT-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' },
];

// Auto-close hour options
export const AUTO_CLOSE_OPTIONS = [
  { value: 1, label: '1 hora' },
  { value: 2, label: '2 horas' },
  { value: 3, label: '3 horas' },
  { value: 4, label: '4 horas' },
  { value: 6, label: '6 horas' },
  { value: 8, label: '8 horas' },
  { value: 12, label: '12 horas' },
  { value: 24, label: '24 horas' },
];
