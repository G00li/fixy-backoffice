// ============================================
// Provider Specialties Types
// ============================================

export type CategoryType = 'primary' | 'secondary';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type MediaType = 'image' | 'video';

// ============================================
// Category Types
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  parent_id?: string;
  level: 1 | 2;
  description?: string;
  keywords?: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

export interface CategorySpecialtyTag {
  id: string;
  category_id: string;
  tag_name: string;
  tag_slug: string;
  description?: string;
  usage_count: number;
  is_approved: boolean;
  is_suggested: boolean;
  created_at: string;
}

// ============================================
// Provider Category (Specialty) Types
// ============================================

export interface ProviderCategory {
  id: string;
  provider_id: string;
  category_id: string;
  category_type: CategoryType;
  display_order: number;
  years_experience?: number;
  experience_level?: ExperienceLevel;
  custom_description?: string;
  specialty_tags: string[];
  total_services: number;
  total_bookings: number;
  avg_rating: number;
  is_active: boolean;
  plan_tier: string;
  visibility_boost: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderCategoryWithDetails extends ProviderCategory {
  category_name: string;
  category_slug: string;
}

// ============================================
// Portfolio Types
// ============================================

export interface ProviderPortfolioItem {
  id: string;
  provider_id: string;
  provider_category_id?: string;
  title: string;
  description?: string;
  media_type: MediaType;
  media_url: string;
  thumbnail_url?: string;
  category_id?: string;
  tags: string[];
  views_count: number;
  likes_count: number;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItemWithCategory extends ProviderPortfolioItem {
  category_name?: string;
}

// ============================================
// Certification Types
// ============================================

export interface ProviderCertification {
  id: string;
  provider_id: string;
  provider_category_id?: string;
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  document_url?: string;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CertificationWithCategory extends ProviderCertification {
  category_id?: string;
  category_name?: string;
}

// ============================================
// Request/Response Types
// ============================================

// Specialty Requests
export interface CreateSpecialtyRequest {
  category_id: string;
  category_type: CategoryType;
  display_order: number;
  years_experience?: number;
  experience_level?: ExperienceLevel;
  custom_description?: string;
  specialty_tags?: string[];
}

export interface UpdateSpecialtyRequest {
  years_experience?: number;
  experience_level?: ExperienceLevel;
  custom_description?: string;
  specialty_tags?: string[];
  is_active?: boolean;
}

// Portfolio Requests
export interface CreatePortfolioRequest {
  provider_category_id?: string;
  title: string;
  description?: string;
  media_type: MediaType;
  media_url: string;
  thumbnail_url?: string;
  category_id?: string;
  tags?: string[];
  is_featured?: boolean;
}

export interface UpdatePortfolioRequest {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  tags?: string[];
  is_featured?: boolean;
  is_active?: boolean;
}

export interface ReorderPortfolioRequest {
  items: Array<{
    id: string;
    display_order: number;
  }>;
}

// Certification Requests
export interface CreateCertificationRequest {
  provider_category_id?: string;
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  document_url?: string;
}

export interface UpdateCertificationRequest {
  name?: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  document_url?: string;
  is_active?: boolean;
}

// Search Request
export interface SearchProvidersRequest {
  search_text?: string;
  category_ids?: string[];
  specialty_tags?: string[];
  user_lat?: number;
  user_lng?: number;
  radius_km?: number;
  min_rating?: number;
  experience_level?: ExperienceLevel;
  show_closed?: boolean;
  sort_by?: 'relevance' | 'rating' | 'distance' | 'experience';
  limit?: number;
  offset?: number;
}

// Search Response
export interface ProviderSearchResult {
  provider_id: string;
  full_name: string;
  business_name?: string;
  avatar_url?: string;
  location_text?: string;
  bio?: string;
  is_verified: boolean;
  primary_category_id: string;
  primary_category_name: string;
  primary_experience_years?: number;
  primary_specialty_tags: string[];
  secondary_categories: Array<{
    category_id: string;
    category_name: string;
    specialty_tags: string[];
    display_order: number;
  }>;
  avg_rating: number;
  total_reviews: number;
  total_bookings: number;
  distance_km?: number;
  is_open: boolean;
  status_type: string;
  relevance_score: number;
}

// Complete Profile Response
export interface CompleteProviderProfile {
  profile: {
    id: string;
    full_name: string;
    business_name?: string;
    display_name?: string;
    avatar_url?: string;
    cover_image_url?: string;
    bio?: string;
    location_text?: string;
    is_verified: boolean;
    verified_at?: string;
    email?: string;
    phone?: string;
    social_media?: Record<string, string>;
  };
  primary_category?: {
    id: string;
    category_id: string;
    category_name: string;
    category_slug: string;
    years_experience?: number;
    experience_level?: ExperienceLevel;
    custom_description?: string;
    specialty_tags: string[];
    avg_rating: number;
    total_services: number;
    total_bookings: number;
  };
  secondary_categories: Array<{
    id: string;
    category_id: string;
    category_name: string;
    category_slug: string;
    years_experience?: number;
    experience_level?: ExperienceLevel;
    specialty_tags: string[];
    display_order: number;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issue_date?: string;
    expiry_date?: string;
    credential_id?: string;
    credential_url?: string;
    document_url?: string;
    is_verified: boolean;
    verified_at?: string;
    category_id?: string;
    category_name?: string;
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    description?: string;
    media_type: MediaType;
    media_url: string;
    thumbnail_url?: string;
    category_id?: string;
    category_name?: string;
    tags: string[];
    is_featured: boolean;
    views_count: number;
    likes_count: number;
  }>;
  statistics: {
    avg_rating: number;
    total_reviews: number;
    total_bookings: number;
    completed_bookings: number;
    followers_count: number;
  };
  status?: {
    is_open: boolean;
    status_type: string;
    status_message?: string;
    auto_close_at?: string;
    updated_at?: string;
  };
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// ============================================
// Validation Constants
// ============================================

export const PROVIDER_LIMITS = {
  SPECIALTY_TAGS_PER_CATEGORY: 10,
  PORTFOLIO_ITEMS: 50,
  CERTIFICATIONS: 20,
  DESCRIPTION_MAX_LENGTH: 1000,
  MAX_SECONDARY_CATEGORIES: 2,
} as const;

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
];

export const MEDIA_TYPES: MediaType[] = ['image', 'video'];
