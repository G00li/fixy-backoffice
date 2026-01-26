import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Edge runtime para performance máxima
export const runtime = 'edge';

// Revalidate cache a cada 5 minutos
export const revalidate = 300;

interface FeedParams {
  cursor?: string; // timestamp do último post para cursor pagination
  limit: number;
  providerId?: string;
  followingOnly?: boolean;
  categoryId?: string;
  tags?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse e validação de parâmetros
    const params: FeedParams = {
      cursor: searchParams.get('cursor') || undefined,
      limit: Math.min(parseInt(searchParams.get('limit') || '20') || 20, 50), // max 50 por segurança
      providerId: searchParams.get('providerId') || undefined,
      followingOnly: searchParams.get('followingOnly') === 'true',
      categoryId: searchParams.get('categoryId') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
    };

    const supabase = await createClient();
    
    // Get current user (opcional - para followingOnly e user_has_liked)
    const { data: { user } } = await supabase.auth.getUser();

    // Build query otimizada com cursor pagination
    let query = supabase
      .from('provider_posts')
      .select(`
        id,
        provider_id,
        type,
        media_urls,
        thumbnail_url,
        caption,
        tags,
        likes_count,
        comments_count,
        views_count,
        is_pinned,
        created_at,
        provider:profiles!provider_posts_provider_id_fkey (
          id,
          full_name,
          business_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('is_active', true)
      .eq('moderation_status', 'approved')
      .order('is_pinned', { ascending: false }) // Posts fixados primeiro
      .order('created_at', { ascending: false })
      .limit(params.limit);

    // Cursor pagination (mais eficiente que offset para grandes datasets)
    if (params.cursor) {
      query = query.lt('created_at', params.cursor);
    }

    // Aplicar filtros
    if (params.providerId) {
      query = query.eq('provider_id', params.providerId);
    }

    if (params.categoryId) {
      query = query.eq('service_id', params.categoryId);
    }

    if (params.tags && params.tags.length > 0) {
      query = query.contains('tags', params.tags);
    }

    // Filtro "Following only"
    if (params.followingOnly && user) {
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      const followingIds = following?.map(f => f.following_id) || [];
      
      if (followingIds.length > 0) {
        query = query.in('provider_id', followingIds);
      } else {
        // Usuário não segue ninguém, retorna vazio
        return NextResponse.json(
          {
            posts: [],
            nextCursor: null,
            hasMore: false,
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
          }
        );
      }
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Feed API error:', error);
      throw error;
    }

    // Verificar se usuário deu like em cada post (se autenticado)
    let postsWithLikes = posts || [];
    if (user && posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      
      postsWithLikes = posts.map(post => ({
        ...post,
        provider_name: post.provider?.full_name || post.provider?.business_name || 'Provider',
        provider_avatar: post.provider?.avatar_url || null,
        provider_is_verified: post.provider?.is_verified || false,
        user_has_liked: likedPostIds.has(post.id),
      }));
    } else if (posts) {
      postsWithLikes = posts.map(post => ({
        ...post,
        provider_name: post.provider?.full_name || post.provider?.business_name || 'Provider',
        provider_avatar: post.provider?.avatar_url || null,
        provider_is_verified: post.provider?.is_verified || false,
        user_has_liked: false,
      }));
    }

    // Calcular next cursor (timestamp do último post)
    const nextCursor = postsWithLikes && postsWithLikes.length === params.limit
      ? postsWithLikes[postsWithLikes.length - 1].created_at
      : null;

    // Response com cache headers otimizados
    return NextResponse.json(
      {
        posts: postsWithLikes,
        nextCursor,
        hasMore: postsWithLikes ? postsWithLikes.length === params.limit : false,
      },
      {
        headers: {
          // Cache público por 5 minutos, stale-while-revalidate por 10 minutos
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch feed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
