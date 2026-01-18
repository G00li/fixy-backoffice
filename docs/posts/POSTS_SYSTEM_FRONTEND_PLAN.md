# 🎨 Plano de Implementação Frontend - Sistema de Posts

## 📋 Visão Geral

Este documento detalha a implementação do frontend (Types, Actions, Componentes e Páginas) para o sistema de posts.

---

## FASE 2: Types TypeScript

**Arquivo:** `fixy-backoffice/src/types/posts.ts`

### 2.1 Interfaces Principais

```typescript
// =====================================================
// TYPES: Posts System
// =====================================================

export type PostType = 'text' | 'image' | 'video' | 'carousel';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

// Post básico
export interface Post {
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
  is_pinned: boolean;
  pinned_at: string | null;
  pinned_order: number;
  is_promoted: boolean;
  promotion_start_date: string | null;
  promotion_end_date: string | null;
  promotion_budget: number;
  promotion_impressions: number;
  promotion_clicks: number;
  promotion_ctr: number;
  moderation_status: ModerationStatus;
  moderation_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

// Post com detalhes do provider
export interface PostWithProvider extends Post {
  provider: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    is_verified: boolean;
    business_name: string | null;
  };
  service: {
    id: string;
    title: string;
  } | null;
  user_has_liked: boolean;
  user_has_saved: boolean;
}

// Like em post
export interface PostLike {
  user_id: string;
  post_id: string;
  created_at: string;
}

// Comentário em post
export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  parent_comment_id: string | null;
  replies_count: number;
  likes_count: number;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
}

// Comentário com detalhes do usuário
export interface PostCommentWithUser extends PostComment {
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  user_has_liked: boolean;
  replies?: PostCommentWithUser[];
}

// Like em comentário
export interface CommentLike {
  user_id: string;
  comment_id: string;
  created_at: string;
}

// =====================================================
// PARAMS: Criação e Atualização
// =====================================================

export interface CreatePostParams {
  type: PostType;
  media_urls?: string[];
  thumbnail_url?: string;
  caption?: string;
  service_id?: string;
  tags?: string[];
  alt_text?: string;
}

export interface UpdatePostParams {
  caption?: string;
  service_id?: string;
  tags?: string[];
  alt_text?: string;
  is_active?: boolean;
}

export interface CreateCommentParams {
  post_id: string;
  comment: string;
  parent_comment_id?: string;
}

export interface UpdateCommentParams {
  comment: string;
}

// =====================================================
// FILTERS: Busca e Filtros
// =====================================================

export interface PostFilters {
  provider_id?: string;
  type?: PostType;
  service_id?: string;
  tags?: string[];
  is_pinned?: boolean;
  is_promoted?: boolean;
  moderation_status?: ModerationStatus;
  following_only?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

// =====================================================
// RESPONSES: Respostas de API
// =====================================================

export interface CreatePostResponse {
  success: boolean;
  post?: Post;
  error?: string;
}

export interface PinPostResponse {
  success: boolean;
  pinned_count?: number;
  max_allowed?: number;
  error?: string;
}

export interface PostFeedResponse {
  posts: PostWithProvider[];
  total: number;
  has_more: boolean;
}

// =====================================================
// STATS: Estatísticas
// =====================================================

export interface PostStats {
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_views: number;
  total_shares: number;
  pinned_posts: number;
  promoted_posts: number;
  avg_engagement_rate: number;
  top_performing_post: PostWithProvider | null;
}

// =====================================================
// CONSTANTS: Constantes e Labels
// =====================================================

export const POST_TYPE_LABELS: Record<PostType, string> = {
  text: 'Texto',
  image: 'Imagem',
  video: 'Vídeo',
  carousel: 'Carrossel',
};

export const POST_TYPE_ICONS: Record<PostType, string> = {
  text: '📝',
  image: '🖼️',
  video: '🎥',
  carousel: '🎠',
};

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export const MODERATION_STATUS_COLORS: Record<ModerationStatus, string> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
};

// Limites por plano
export const POST_LIMITS = {
  free: {
    max_posts_per_month: 10,
    max_images_per_post: 5,
    max_video_duration_seconds: 0, // Sem vídeos
    max_pinned_posts: 1,
    can_promote: false,
  },
  premium: {
    max_posts_per_month: -1, // Ilimitado
    max_images_per_post: 10,
    max_video_duration_seconds: 120, // 2 minutos
    max_pinned_posts: 3,
    can_promote: false,
  },
  premium_plus: {
    max_posts_per_month: -1, // Ilimitado
    max_images_per_post: 20,
    max_video_duration_seconds: 300, // 5 minutos
    max_pinned_posts: 5,
    can_promote: true,
  },
};

// Validações
export const POST_VALIDATION = {
  caption_max_length: 2000,
  caption_min_length: 1,
  tags_max_count: 10,
  tags_max_length: 30,
  comment_max_length: 500,
  comment_min_length: 1,
};
```

---

## FASE 3: Server Actions

**Arquivo:** `fixy-backoffice/src/app/actions/posts.ts`

### 3.1 Actions de Posts

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  Post,
  PostWithProvider,
  CreatePostParams,
  UpdatePostParams,
  PostFilters,
  PostFeedResponse,
  CreatePostResponse,
  PinPostResponse,
  PostStats,
} from '@/types/posts';

// =====================================================
// CRIAR POST
// =====================================================
export async function createPost(
  params: CreatePostParams
): Promise<CreatePostResponse> {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Verificar se é provider
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'provider') {
      return { success: false, error: 'Apenas providers podem criar posts' };
    }

    // Criar post
    const { data: post, error } = await supabase
      .from('provider_posts')
      .insert({
        provider_id: user.id,
        type: params.type,
        media_urls: params.media_urls || [],
        thumbnail_url: params.thumbnail_url,
        caption: params.caption,
        service_id: params.service_id,
        tags: params.tags || [],
        alt_text: params.alt_text,
        moderation_status: 'approved', // Auto-aprovar por enquanto
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/provider/posts');
    revalidatePath('/feed');

    return { success: true, post };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar post',
    };
  }
}

// =====================================================
// ATUALIZAR POST
// =====================================================
export async function updatePost(
  postId: string,
  params: UpdatePostParams
): Promise<CreatePostResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { data: post, error } = await supabase
      .from('provider_posts')
      .update(params)
      .eq('id', postId)
      .eq('provider_id', user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/provider/posts');
    revalidatePath(`/posts/${postId}`);

    return { success: true, post };
  } catch (error) {
    console.error('Error updating post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar post',
    };
  }
}

// =====================================================
// DELETAR POST
// =====================================================
export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { error } = await supabase
      .from('provider_posts')
      .delete()
      .eq('id', postId)
      .eq('provider_id', user.id);

    if (error) throw error;

    revalidatePath('/provider/posts');
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar post',
    };
  }
}

// =====================================================
// BUSCAR POSTS (FEED)
// =====================================================
export async function getPostsFeed(
  filters: PostFilters = {}
): Promise<PostFeedResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    // Usar função SQL para buscar feed
    const { data, error } = await supabase.rpc('get_posts_feed', {
      user_uuid: user?.id || null,
      limit_count: limit,
      offset_count: offset,
      filter_provider_id: filters.provider_id || null,
      filter_following_only: filters.following_only || false,
    });

    if (error) throw error;

    const posts = (data || []) as PostWithProvider[];

    return {
      posts,
      total: posts.length,
      has_more: posts.length === limit,
    };
  } catch (error) {
    console.error('Error fetching posts feed:', error);
    return {
      posts: [],
      total: 0,
      has_more: false,
    };
  }
}

// =====================================================
// BUSCAR POST POR ID
// =====================================================
export async function getPostById(
  postId: string
): Promise<{ post: PostWithProvider | null; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: post, error } = await supabase
      .from('provider_posts')
      .select(
        `
        *,
        provider:profiles!provider_id(
          id,
          full_name,
          avatar_url,
          is_verified,
          business_name
        ),
        service:services(
          id,
          title
        )
      `
      )
      .eq('id', postId)
      .single();

    if (error) throw error;

    // Verificar se usuário deu like
    let user_has_liked = false;
    if (user) {
      const { data: like } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      user_has_liked = !!like;
    }

    // Incrementar visualizações
    await supabase.rpc('increment_post_views', { post_uuid: postId });

    return {
      post: {
        ...post,
        user_has_liked,
        user_has_saved: false,
      } as PostWithProvider,
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      post: null,
      error: error instanceof Error ? error.message : 'Erro ao buscar post',
    };
  }
}

// =====================================================
// FIXAR POST
// =====================================================
export async function pinPost(postId: string): Promise<PinPostResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { data, error } = await supabase.rpc('pin_post', {
      post_uuid: postId,
      provider_uuid: user.id,
    });

    if (error) throw error;

    const result = data as PinPostResponse;

    if (!result.success) {
      return result;
    }

    revalidatePath('/provider/posts');
    revalidatePath(`/provider/${user.id}`);

    return result;
  } catch (error) {
    console.error('Error pinning post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fixar post',
    };
  }
}

// =====================================================
// DESFIXAR POST
// =====================================================
export async function unpinPost(postId: string): Promise<PinPostResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { data, error } = await supabase.rpc('unpin_post', {
      post_uuid: postId,
      provider_uuid: user.id,
    });

    if (error) throw error;

    revalidatePath('/provider/posts');
    revalidatePath(`/provider/${user.id}`);

    return { success: true };
  } catch (error) {
    console.error('Error unpinning post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao desfixar post',
    };
  }
}

// =====================================================
// DAR LIKE
// =====================================================
export async function likePost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { error } = await supabase.from('post_likes').insert({
      user_id: user.id,
      post_id: postId,
    });

    if (error) throw error;

    revalidatePath(`/posts/${postId}`);
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('Error liking post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao dar like',
    };
  }
}

// =====================================================
// REMOVER LIKE
// =====================================================
export async function unlikePost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    if (error) throw error;

    revalidatePath(`/posts/${postId}`);
    revalidatePath('/feed');

    return { success: true };
  } catch (error) {
    console.error('Error unliking post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao remover like',
    };
  }
}

// =====================================================
// BUSCAR ESTATÍSTICAS
// =====================================================
export async function getPostStats(providerId?: string): Promise<PostStats | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const targetProviderId = providerId || user?.id;
    if (!targetProviderId) return null;

    const { data: posts } = await supabase
      .from('provider_posts')
      .select('*')
      .eq('provider_id', targetProviderId)
      .eq('is_active', true);

    if (!posts || posts.length === 0) {
      return {
        total_posts: 0,
        total_likes: 0,
        total_comments: 0,
        total_views: 0,
        total_shares: 0,
        pinned_posts: 0,
        promoted_posts: 0,
        avg_engagement_rate: 0,
        top_performing_post: null,
      };
    }

    const total_likes = posts.reduce((sum, p) => sum + p.likes_count, 0);
    const total_comments = posts.reduce((sum, p) => sum + p.comments_count, 0);
    const total_views = posts.reduce((sum, p) => sum + p.views_count, 0);
    const total_shares = posts.reduce((sum, p) => sum + p.shares_count, 0);
    const pinned_posts = posts.filter((p) => p.is_pinned).length;
    const promoted_posts = posts.filter((p) => p.is_promoted).length;

    const avg_engagement_rate =
      total_views > 0 ? ((total_likes + total_comments) / total_views) * 100 : 0;

    // Top performing post
    const topPost = posts.reduce((max, p) => {
      const engagement = p.likes_count + p.comments_count * 2;
      const maxEngagement = max.likes_count + max.comments_count * 2;
      return engagement > maxEngagement ? p : max;
    }, posts[0]);

    return {
      total_posts: posts.length,
      total_likes,
      total_comments,
      total_views,
      total_shares,
      pinned_posts,
      promoted_posts,
      avg_engagement_rate: Math.round(avg_engagement_rate * 100) / 100,
      top_performing_post: topPost as any,
    };
  } catch (error) {
    console.error('Error fetching post stats:', error);
    return null;
  }
}
```

### 3.2 Actions de Comentários

```typescript
// =====================================================
// CRIAR COMENTÁRIO
// =====================================================
export async function createComment(
  params: CreateCommentParams
): Promise<{ success: boolean; comment?: PostComment; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: params.post_id,
        user_id: user.id,
        comment: params.comment,
        parent_comment_id: params.parent_comment_id,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/posts/${params.post_id}`);

    return { success: true, comment };
  } catch (error) {
    console.error('Error creating comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar comentário',
    };
  }
}

// =====================================================
// ATUALIZAR COMENTÁRIO
// =====================================================
export async function updateComment(
  commentId: string,
  params: UpdateCommentParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { error } = await supabase
      .from('post_comments')
      .update({
        comment: params.comment,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/posts');

    return { success: true };
  } catch (error) {
    console.error('Error updating comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar comentário',
    };
  }
}

// =====================================================
// DELETAR COMENTÁRIO
// =====================================================
export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/posts');

    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar comentário',
    };
  }
}

// =====================================================
// BUSCAR COMENTÁRIOS DE UM POST
// =====================================================
export async function getPostComments(
  postId: string
): Promise<{ comments: PostCommentWithUser[]; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: comments, error } = await supabase
      .from('post_comments')
      .select(
        `
        *,
        user:profiles!user_id(
          id,
          full_name,
          avatar_url,
          is_verified
        )
      `
      )
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Buscar likes do usuário
    const commentsWithLikes = await Promise.all(
      (comments || []).map(async (comment) => {
        let user_has_liked = false;
        if (user) {
          const { data: like } = await supabase
            .from('comment_likes')
            .select('user_id')
            .eq('comment_id', comment.id)
            .eq('user_id', user.id)
            .single();

          user_has_liked = !!like;
        }

        // Buscar respostas
        const { data: replies } = await supabase
          .from('post_comments')
          .select(
            `
            *,
            user:profiles!user_id(
              id,
              full_name,
              avatar_url,
              is_verified
            )
          `
          )
          .eq('parent_comment_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          user_has_liked,
          replies: replies || [],
        } as PostCommentWithUser;
      })
    );

    return { comments: commentsWithLikes };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return {
      comments: [],
      error: error instanceof Error ? error.message : 'Erro ao buscar comentários',
    };
  }
}
```

---

## 📊 Resumo da Implementação Frontend

| Componente | Arquivo | Linhas Estimadas |
|------------|---------|------------------|
| **Types** | `types/posts.ts` | ~300 |
| **Actions - Posts** | `actions/posts.ts` | ~400 |
| **Actions - Comments** | `actions/posts.ts` | ~200 |
| **TOTAL BACKEND** | | **~900 linhas** |

---

## 🚀 Próximos Passos

1. ✅ Criar types TypeScript
2. ✅ Criar server actions
3. ⏳ Criar componentes React (próximo documento)
4. ⏳ Criar páginas Next.js
5. ⏳ Testar fluxo completo

---

**Status:** 📋 **PLANO DETALHADO - PRONTO PARA IMPLEMENTAÇÃO**

**Última atualização:** 2026-01-16
