'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PostWithProvider } from '@/types/posts';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostFeedCardProps {
  post: PostWithProvider;
  onToggleLike?: (postId: string, currentlyLiked: boolean) => void;
  isTogglingLike?: boolean;
}

const PostFeedCard = memo(function PostFeedCard({ 
  post, 
  onToggleLike,
  isTogglingLike = false 
}: PostFeedCardProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleLike?.(post.id, post.user_has_liked);
  };

  return (
    <Link
      href={`/posts/${post.id}`}
      prefetch={true}
      className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      {/* Provider Info */}
      <div className="p-4 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={post.provider_avatar || '/images/user/user-01.jpg'}
            alt={post.provider_name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate flex items-center gap-1">
            {post.provider_name}
            {post.provider_is_verified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
        {post.is_pinned && (
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78-.03 1.632.545 2.206.575.574 1.426.794 2.206.545l2.552-.818a1 1 0 011.233.476l.83 1.45a1 1 0 01-1.546 1.296l-2.106-1.263-1.263 2.106a1 1 0 01-1.296 1.546l-1.45-.83a1 1 0 01-.476-1.233l.818-2.552c-.78-.25-1.632-.03-2.206-.545-.574-.575-.794-1.426-.545-2.206l.818-2.552a1 1 0 011.233-.476l1.45.83a1 1 0 01.476 1.233z" />
            </svg>
          </div>
        )}
      </div>

      {/* Media */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
        {post.type === 'video' ? (
          <video
            src={post.media_urls?.[0]}
            poster={post.thumbnail_url || undefined}
            className="w-full h-full object-cover"
            preload="metadata"
          />
        ) : (
          <Image
            src={post.media_urls?.[0] || '/images/placeholder.jpg'}
            alt={post.caption || 'Post image'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        {/* Carousel indicator */}
        {post.type === 'carousel' && post.media_urls && post.media_urls.length > 1 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-md flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {post.media_urls.length}
          </div>
        )}

        {/* Video indicator */}
        {post.type === 'video' && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-md flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Vídeo
          </div>
        )}
      </div>

      {/* Actions and Content */}
      <div className="p-4">
        {/* Action buttons */}
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={handleLike}
            disabled={isTogglingLike}
            className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${
              post.user_has_liked 
                ? 'text-red-500' 
                : 'text-gray-700 dark:text-gray-300 hover:text-red-500'
            }`}
          >
            <svg 
              className="w-5 h-5" 
              fill={post.user_has_liked ? 'currentColor' : 'none'} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">{post.likes_count}</span>
          </button>

          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{post.comments_count}</span>
          </div>

          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 ml-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm">{post.views_count}</span>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
            {post.caption}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
});

export default PostFeedCard;
