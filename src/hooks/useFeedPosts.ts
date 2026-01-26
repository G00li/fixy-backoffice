'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PostWithProvider, PostFilters } from '@/types/posts';

interface FeedResponse {
  posts: PostWithProvider[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface UseFeedPostsOptions {
  filters?: PostFilters;
  enabled?: boolean;
}

export function useFeedPosts(options: UseFeedPostsOptions = {}) {
  const { filters = {}, enabled = true } = options;
  const queryClient = useQueryClient();

  // Build query params
  const buildParams = (cursor?: string) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', '20');
    if (filters.provider_id) params.set('providerId', filters.provider_id);
    if (filters.following_only) params.set('followingOnly', 'true');
    if (filters.service_id) params.set('categoryId', filters.service_id);
    if (filters.tags?.length) params.set('tags', filters.tags.join(','));
    return params.toString();
  };

  // Infinite query com cache de 5 minutos
  const query = useInfiniteQuery<FeedResponse>({
    queryKey: ['feed', 'posts', filters],
    queryFn: async ({ pageParam }) => {
      const params = buildParams(pageParam as string | undefined);
      const response = await fetch(`/api/feed/posts?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch posts');
      }
      
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
    gcTime: 10 * 60 * 1000, // 10 minutos - garbage collection
    enabled,
  });

  // Like mutation com optimistic update
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to like post');
      }
      
      return response.json();
    },
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feed', 'posts'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['feed', 'posts', filters]);

      // Optimistically update to new value
      queryClient.setQueryData(['feed', 'posts', filters], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId
                ? { 
                    ...post, 
                    likes_count: post.likes_count + 1, 
                    user_has_liked: true 
                  }
                : post
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['feed', 'posts', filters], context.previousData);
      }
      console.error('Error liking post:', err);
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ['feed', 'posts'] });
    },
  });

  // Unlike mutation com optimistic update
  const unlikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unlike post');
      }
      
      return response.json();
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed', 'posts'] });

      const previousData = queryClient.getQueryData(['feed', 'posts', filters]);

      queryClient.setQueryData(['feed', 'posts', filters], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId
                ? { 
                    ...post, 
                    likes_count: Math.max(0, post.likes_count - 1), 
                    user_has_liked: false 
                  }
                : post
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['feed', 'posts', filters], context.previousData);
      }
      console.error('Error unliking post:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'posts'] });
    },
  });

  // Flatten posts from pages
  const posts = query.data?.pages.flatMap((page) => page.posts) || [];

  // Toggle like (like ou unlike baseado no estado atual)
  const toggleLike = (postId: string, currentlyLiked: boolean) => {
    if (currentlyLiked) {
      unlikeMutation.mutate(postId);
    } else {
      likeMutation.mutate(postId);
    }
  };

  return {
    posts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    toggleLike,
    isTogglingLike: likeMutation.isPending || unlikeMutation.isPending,
  };
}
