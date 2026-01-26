'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFeedPosts } from '@/hooks/useFeedPosts';
import { PostFilters } from '@/types/posts';
import PostFeedCard from './PostFeedCard';
import PostFeedSkeleton from './PostFeedSkeleton';
import PostFeedFilters from './PostFeedFilters';

interface PostFeedProps {
  initialFilters?: PostFilters;
}

export default function PostFeed({ initialFilters = {} }: PostFeedProps) {
  const [filters, setFilters] = useState<PostFilters>(initialFilters);

  const {
    posts,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    toggleLike,
    isTogglingLike,
  } = useFeedPosts({ filters });

  // Intersection Observer para infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '400px', // Carregar antes de chegar no fim (melhor UX)
  });

  // Fetch next page quando o trigger ficar visível
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Loading inicial
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PostFeedFilters onFilterChange={setFilters} currentFilters={filters} />
        <PostFeedSkeleton count={6} />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <PostFeedFilters onFilterChange={setFilters} currentFilters={filters} />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Erro ao carregar posts
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error instanceof Error ? error.message : 'Ocorreu um erro inesperado'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="space-y-6">
        <PostFeedFilters onFilterChange={setFilters} currentFilters={filters} />
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum post encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filters.following_only
              ? 'Você ainda não segue nenhum provider. Comece a seguir para ver posts aqui!'
              : 'Não há posts disponíveis no momento. Volte mais tarde!'}
          </p>
          {filters.following_only && (
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Ver todos os posts
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <PostFeedFilters onFilterChange={setFilters} currentFilters={filters} />

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostFeedCard
            key={post.id}
            post={post}
            onToggleLike={toggleLike}
            isTogglingLike={isTogglingLike}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="py-4">
          <PostFeedSkeleton count={3} />
        </div>
      )}

      {/* Intersection observer trigger */}
      {hasNextPage && !isFetchingNextPage && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            Carregando mais posts...
          </div>
        </div>
      )}

      {/* End of feed message */}
      {!hasNextPage && posts.length > 0 && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Você chegou ao fim do feed
          </div>
        </div>
      )}
    </div>
  );
}
