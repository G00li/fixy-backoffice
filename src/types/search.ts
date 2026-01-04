// Search-related types

export type SortOption = 'relevance' | 'rating' | 'distance' | 'reviews';
export type StatusFilter = 'all' | 'open' | 'closed' | 'busy' | 'emergency_only';

export interface SearchFilters {
  searchText?: string;
  categoryId?: string;
  userLat?: number;
  userLng?: number;
  radiusKm?: number;
  minRating?: number;
  showClosed?: boolean;
  sortBy?: SortOption;
}

export interface SearchParams extends SearchFilters {
  page?: number;
  limit?: number;
}

export interface ProviderSearchResult {
  id: string;
  full_name: string | null;
  business_name: string | null;
  avatar_url: string | null;
  location_text: string | null;
  bio: string | null;
  is_verified: boolean | null;
  avg_rating: number;
  total_reviews: number;
  distance_km: number | null;
  is_open: boolean;
  status_type: 'open' | 'closed' | 'busy' | 'emergency_only';
}

export interface SearchResponse {
  success: boolean;
  results?: ProviderSearchResult[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

// Validation constants
export const SEARCH_VALIDATION = {
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
  MIN_RADIUS_KM: 1,
  MAX_RADIUS_KM: 100,
  DEFAULT_RADIUS_KM: 20,
  MIN_RATING: 0,
  MAX_RATING: 5,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Sort options for UI
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'distance', label: 'Mais Próximo' },
  { value: 'reviews', label: 'Mais Avaliações' },
];

// Radius options for UI
export const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
];

// Status badge colors
export const STATUS_COLORS = {
  open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  busy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  emergency_only: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
} as const;

// Status labels
export const STATUS_LABELS = {
  open: 'Aberto',
  closed: 'Fechado',
  busy: 'Ocupado',
  emergency_only: 'Apenas Emergências',
} as const;
