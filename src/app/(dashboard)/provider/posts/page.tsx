'use client';

import { useEffect, useState } from 'react';
import { getProviderPosts } from '@/app/actions/posts';
import AuthGuard from '@/components/auth/AuthGuard';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { PlusIcon } from '@/icons';

interface Post {
  id: string;
  type: 'text' | 'image' | 'video' | 'carousel';
  caption: string | null;
  media_urls: string[] | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  is_active: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
}

function ProviderPostsContent() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      if (!user) return;
      
      setLoading(true);
      try {
        const { posts: fetchedPosts } = await getProviderPosts({
          providerId: user.id,
          includeInactive: true,
          page: 1,
          limit: 50,
        });
        setPosts(fetchedPosts || []);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-r-transparent"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            My Posts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your portfolio and showcase your work
          </p>
        </div>
        <Link
          href="/provider/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Start showcasing your work by creating your first post
            </p>
            <Link
              href="/provider/posts/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Create First Post
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/provider/posts/${post.id}`}
              className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              {/* Post Image/Video */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {post.type === 'video' ? (
                  <video
                    src={post.media_urls?.[0]}
                    poster={post.thumbnail_url || undefined}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={post.media_urls?.[0]}
                    alt={post.caption || 'Post image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                  {/* Post Type Badge */}
                  <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-md flex items-center gap-1">
                    {post.type === 'carousel' ? (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {post.media_urls?.length || 0}
                      </>
                    ) : post.type === 'video' ? (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Video
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Photo
                      </>
                    )}
                  </span>

                  {/* Status Badge */}
                  {!post.is_active && (
                    <span className="px-2 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-md">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Bottom Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.views_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments_count || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post Info */}
              <div className="p-3">
                {/* Caption */}
                {post.caption && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2 min-h-[2.5rem]">
                    {post.caption}
                  </p>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Hover Action Indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                  <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProviderPostsPage() {
  return (
    <AuthGuard requiredRole="provider">
      <ProviderPostsContent />
    </AuthGuard>
  );
}
