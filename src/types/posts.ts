// Post-related types

export type PostType = 'image' | 'video' | 'carousel';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ProviderPost {
  id: string;
  provider_id: string;
  type: PostType;
  media_urls: string[];
  thumbnail_url: string | null;
  caption: string | null;
  service_id: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_active: boolean;
  moderation_status: ModerationStatus;
  moderation_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface PostLike {
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface CreatePostParams {
  type: PostType;
  media_urls: string[];
  thumbnail_url?: string;
  caption?: string;
  service_id?: string;
  tags?: string[];
  alt_text?: string;
}

export interface UpdatePostParams {
  postId: string;
  caption?: string;
  service_id?: string;
  tags?: string[];
  alt_text?: string;
  is_active?: boolean;
}

export interface PostWithProvider extends ProviderPost {
  provider: {
    id: string;
    full_name: string | null;
    business_name: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
  };
}

// Validation constants
export const POST_VALIDATION = {
  MAX_CAPTION_LENGTH: 2000,
  MAX_TAGS: 10,
  MAX_MEDIA_FILES: 10,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
} as const;
