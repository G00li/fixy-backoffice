// Review system types

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  provider_id: string;
  quality_rating: number; // 1-5
  punctuality_rating: number; // 1-5
  communication_rating: number; // 1-5
  value_rating: number; // 1-5
  overall_rating: number; // Calculated average
  comment: string | null;
  images: string[];
  provider_response: string | null;
  provider_response_at: string | null;
  is_verified: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithDetails extends Review {
  // Reviewer info
  reviewer_name: string | null;
  reviewer_avatar: string | null;
  
  // Booking info
  service_id: string | null;
  booking_date: string;
  
  // Service info
  service_title: string | null;
  
  // Calculated
  days_since_review: number;
  can_edit: boolean;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  quality_avg: number;
  punctuality_avg: number;
  communication_avg: number;
  value_avg: number;
  rating_5_count: number;
  rating_4_count: number;
  rating_3_count: number;
  rating_2_count: number;
  rating_1_count: number;
  with_photos_count: number;
  with_response_count: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

// Request/Response types

export interface CreateReviewParams {
  booking_id: string;
  quality_rating: number;
  punctuality_rating: number;
  communication_rating: number;
  value_rating: number;
  comment?: string;
  images?: string[];
}

export interface CreateReviewResponse {
  review_id: string | null;
  success: boolean;
  message: string;
}

export interface UpdateReviewParams {
  review_id: string;
  quality_rating: number;
  punctuality_rating: number;
  communication_rating: number;
  value_rating: number;
  comment?: string;
  images?: string[];
}

export interface RespondToReviewParams {
  review_id: string;
  response: string;
}

export interface FlagReviewParams {
  review_id: string;
  reason: string;
}

export interface GetProviderReviewsParams {
  provider_id: string;
  min_rating?: number;
  with_photos_only?: boolean;
  limit?: number;
  offset?: number;
}

// Filter types

export interface ReviewFilters {
  min_rating?: number;
  with_photos?: boolean;
  with_response?: boolean;
  sort_by?: 'recent' | 'rating_high' | 'rating_low';
}

// Constants

export const RATING_LABELS: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};

export const RATING_COLORS: Record<number, string> = {
  1: 'text-red-600 dark:text-red-400',
  2: 'text-orange-600 dark:text-orange-400',
  3: 'text-yellow-600 dark:text-yellow-400',
  4: 'text-green-600 dark:text-green-400',
  5: 'text-emerald-600 dark:text-emerald-400',
};

export const RATING_BG_COLORS: Record<number, string> = {
  1: 'bg-red-100 dark:bg-red-900/20',
  2: 'bg-orange-100 dark:bg-orange-900/20',
  3: 'bg-yellow-100 dark:bg-yellow-900/20',
  4: 'bg-green-100 dark:bg-green-900/20',
  5: 'bg-emerald-100 dark:bg-emerald-900/20',
};

export const RATING_CRITERIA_LABELS: Record<string, string> = {
  quality: 'Qualidade do Serviço',
  punctuality: 'Pontualidade',
  communication: 'Comunicação',
  value: 'Custo-Benefício',
};

export const RATING_CRITERIA_ICONS: Record<string, string> = {
  quality: '⭐',
  punctuality: '⏰',
  communication: '💬',
  value: '💰',
};

// Validation

export const REVIEW_VALIDATION = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MAX_COMMENT_LENGTH: 2000,
  MAX_RESPONSE_LENGTH: 1000,
  MAX_IMAGES: 5,
  EDIT_DEADLINE_DAYS: 7,
} as const;

// Helper functions

export function getRatingLabel(rating: number): string {
  const roundedRating = Math.round(rating);
  return RATING_LABELS[roundedRating] || 'N/A';
}

export function getRatingColor(rating: number): string {
  const roundedRating = Math.round(rating);
  return RATING_COLORS[roundedRating] || 'text-gray-600';
}

export function getRatingBgColor(rating: number): string {
  const roundedRating = Math.round(rating);
  return RATING_BG_COLORS[roundedRating] || 'bg-gray-100';
}

export function calculateRatingDistribution(stats: ReviewStats): RatingDistribution[] {
  const total = stats.total_reviews || 1; // Avoid division by zero
  
  return [
    {
      rating: 5,
      count: stats.rating_5_count,
      percentage: (stats.rating_5_count / total) * 100,
    },
    {
      rating: 4,
      count: stats.rating_4_count,
      percentage: (stats.rating_4_count / total) * 100,
    },
    {
      rating: 3,
      count: stats.rating_3_count,
      percentage: (stats.rating_3_count / total) * 100,
    },
    {
      rating: 2,
      count: stats.rating_2_count,
      percentage: (stats.rating_2_count / total) * 100,
    },
    {
      rating: 1,
      count: stats.rating_1_count,
      percentage: (stats.rating_1_count / total) * 100,
    },
  ];
}

export function canEditReview(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const daysSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= REVIEW_VALIDATION.EDIT_DEADLINE_DAYS;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
