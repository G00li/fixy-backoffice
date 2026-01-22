// =====================================================
// TYPES - SISTEMA DE POSTS
// Definições de tipos TypeScript para o sistema de posts
// =====================================================

// =====================================================
// ENUMS E TIPOS
// =====================================================

export type PostType = 'text' | 'image' | 'video' | 'carousel';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

// =====================================================
// INTERFACES PRINCIPAIS
// =====================================================

/**
 * Post do provider
 */
export interface Post {
  id: string;
  provider_id: string;
  type: PostType;
  media_urls: string[] | null;
  thumbnail_url: string | null;
  caption: string | null;
  service_id: string | null;
  tags: string[] | null;
  
  // Contadores
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  
  // Status
  is_active: boolean;
  
  // Fixação
  is_pinned: boolean;
  pinned_at: string | null;
  pinned_order: number;
  
  // Promoção (futuro)
  is_promoted: boolean;
  promotion_start_date: string | null;
  promotion_end_date: string | null;
  promotion_budget: number;
  promotion_impressions: number;
  promotion_clicks: number;
  
  // Moderação
  moderation_status: ModerationStatus;
  moderation_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  
  // Acessibilidade
  alt_text: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Post com informações do provider (para feed)
 */
export interface PostWithProvider extends Post {
  provider_name: string;
  provider_avatar: string | null;
  provider_is_verified: boolean;
  user_has_liked: boolean;
}

/**
 * Comentário em post
 */
export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  
  // Threading
  parent_comment_id: string | null;
  replies_count: number;
  
  // Engajamento
  likes_count: number;
  
  // Edição
  is_edited: boolean;
  edited_at: string | null;
  
  // Timestamp
  created_at: string;
}

/**
 * Comentário com informações do usuário
 */
export interface PostCommentWithUser extends PostComment {
  user_name: string;
  user_avatar: string | null;
  user_has_liked: boolean;
  replies?: PostCommentWithUser[]; // Respostas aninhadas
}

/**
 * Like em post
 */
export interface PostLike {
  user_id: string;
  post_id: string;
  created_at: string;
}

/**
 * Like em comentário
 */
export interface CommentLike {
  user_id: string;
  comment_id: string;
  created_at: string;
}

// =====================================================
// PARAMS PARA OPERAÇÕES
// =====================================================

/**
 * Parâmetros para criar post
 */
export interface CreatePostParams {
  provider_id: string;
  type: PostType;
  media_urls?: string[];
  thumbnail_url?: string;
  caption?: string;
  service_id?: string;
  tags?: string[];
  alt_text?: string;
}

/**
 * Parâmetros para atualizar post
 */
export interface UpdatePostParams {
  caption?: string;
  tags?: string[];
  alt_text?: string;
  is_active?: boolean;
}

/**
 * Parâmetros para criar comentário
 */
export interface CreateCommentParams {
  post_id: string;
  user_id: string;
  comment: string;
  parent_comment_id?: string;
}

/**
 * Parâmetros para atualizar comentário
 */
export interface UpdateCommentParams {
  comment: string;
}

// =====================================================
// FILTROS E PAGINAÇÃO
// =====================================================

/**
 * Filtros para buscar posts
 */
export interface PostFilters {
  provider_id?: string;
  following_only?: boolean;
  service_id?: string;
  tags?: string[];
  moderation_status?: ModerationStatus;
  is_pinned?: boolean;
  is_promoted?: boolean;
}

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// =====================================================
// RESPOSTAS DE FUNÇÕES SQL
// =====================================================

/**
 * Resposta da função pin_post
 */
export interface PinPostResponse {
  success: boolean;
  error?: string;
  pinned_count?: number;
  max_allowed?: number;
  current_count?: number;
}

/**
 * Resposta da função unpin_post
 */
export interface UnpinPostResponse {
  success: boolean;
}

// =====================================================
// LIMITES POR PLANO
// =====================================================

export interface PostLimits {
  max_images: number;
  max_videos: number;
  max_image_size_mb: number;
  max_video_duration_min?: number;
  max_pinned: number;
}

export const POST_LIMITS: Record<string, PostLimits> = {
  FREE: {
    max_images: 5,
    max_videos: 0,
    max_image_size_mb: 5,
    max_pinned: 1,
  },
  PREMIUM: {
    max_images: 10,
    max_videos: 1,
    max_image_size_mb: 10,
    max_video_duration_min: 2,
    max_pinned: 3,
  },
  'PREMIUM+': {
    max_images: 15,
    max_videos: 3,
    max_image_size_mb: 15,
    max_video_duration_min: 5,
    max_pinned: 5,
  },
} as const;

// =====================================================
// LABELS E CONSTANTES
// =====================================================

export const POST_TYPE_LABELS: Record<PostType, string> = {
  text: 'Texto',
  image: 'Imagem',
  video: 'Vídeo',
  carousel: 'Carrossel',
};

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export const MODERATION_STATUS_COLORS: Record<ModerationStatus, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

// =====================================================
// STORAGE PATHS
// =====================================================

/**
 * Gera path para storage de imagem de post
 */
export function getPostImagePath(
  userId: string,
  postId: string,
  index: number,
): string {
  const timestamp = Date.now();
  return `posts/${userId}/images/${postId}_${timestamp}_${index}.webp`;
}

/**
 * Gera path para storage de vídeo de post
 */
export function getPostVideoPath(userId: string, postId: string): string {
  const timestamp = Date.now();
  return `posts/${userId}/videos/${postId}_${timestamp}.mp4`;
}

/**
 * Gera path para thumbnail de vídeo
 */
export function getPostVideoThumbnailPath(
  userId: string,
  postId: string,
): string {
  const timestamp = Date.now();
  return `posts/${userId}/images/${postId}_${timestamp}_thumb.webp`;
}

// =====================================================
// VALIDAÇÕES
// =====================================================

/**
 * Valida se o usuário pode criar post com o tipo especificado
 */
export function canCreatePostType(
  planName: string,
  postType: PostType,
): boolean {
  const limits = POST_LIMITS[planName.toUpperCase()] || POST_LIMITS.FREE;

  if (postType === 'video' && limits.max_videos === 0) {
    return false;
  }

  return true;
}

/**
 * Valida número de mídias no post
 */
export function validateMediaCount(
  planName: string,
  imageCount: number,
  videoCount: number,
): { valid: boolean; error?: string } {
  const limits = POST_LIMITS[planName.toUpperCase()] || POST_LIMITS.FREE;

  if (imageCount > limits.max_images) {
    return {
      valid: false,
      error: `Máximo de ${limits.max_images} imagens permitido no seu plano`,
    };
  }

  if (videoCount > limits.max_videos) {
    return {
      valid: false,
      error: `Máximo de ${limits.max_videos} vídeos permitido no seu plano`,
    };
  }

  return { valid: true };
}

/**
 * Valida tamanho de arquivo
 */
export function validateFileSize(
  planName: string,
  fileSizeMB: number,
  fileType: 'image' | 'video',
): { valid: boolean; error?: string } {
  const limits = POST_LIMITS[planName.toUpperCase()] || POST_LIMITS.FREE;

  if (fileType === 'image' && fileSizeMB > limits.max_image_size_mb) {
    return {
      valid: false,
      error: `Imagem muito grande. Máximo: ${limits.max_image_size_mb}MB`,
    };
  }

  // Vídeos têm limite fixo de 100MB (definido no bucket)
  if (fileType === 'video' && fileSizeMB > 100) {
    return {
      valid: false,
      error: 'Vídeo muito grande. Máximo: 100MB',
    };
  }

  return { valid: true };
}

// =====================================================
// ALIASES PARA COMPATIBILIDADE COM CÓDIGO EXISTENTE
// =====================================================

/**
 * Alias para compatibilidade
 */
export type ProviderPost = Post;

// =====================================================
// VALIDAÇÕES (COMPATIBILIDADE)
// =====================================================

export const POST_VALIDATION = {
  MAX_MEDIA_FILES: 15,
  MAX_CAPTION_LENGTH: 2000,
  MAX_TAGS: 10,
  MAX_IMAGE_SIZE: 15 * 1024 * 1024, // 15MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
} as const;

// =====================================================
// INTERFACE ADICIONAL PARA UpdatePostParams
// =====================================================

/**
 * Estender UpdatePostParams com postId para compatibilidade
 */
export interface UpdatePostParamsWithId extends UpdatePostParams {
  postId: string;
}
