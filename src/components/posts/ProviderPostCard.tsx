"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProviderPost, PostWithProvider } from "@/types/posts";
import { likePost, unlikePost, deleteProviderPost } from "@/app/actions/posts";
import PostEngagementStats from "./PostEngagementStats";
import VerifiedBadge from "../ui/verified-badge/VerifiedBadge";
import Badge from "../ui/badge/Badge";

interface ProviderPostCardProps {
  post: ProviderPost | PostWithProvider;
  showActions?: boolean;
  isOwner?: boolean;
  onDelete?: () => void;
}

const ProviderPostCard: React.FC<ProviderPostCardProps> = ({
  post,
  showActions = true,
  isOwner = false,
  onDelete,
}) => {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const provider = 'provider' in post ? post.provider : null;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    const result = liked ? await unlikePost(post.id) : await likePost(post.id);
    
    if (result.success) {
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
    }
    
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setLoading(true);
    const result = await deleteProviderPost(post.id);
    
    if (result.success) {
      onDelete?.();
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete post');
    }
    
    setLoading(false);
  };

  const handleEdit = () => {
    router.push(`/providers/${post.provider_id}/posts/${post.id}/edit`);
  };

  const handleCardClick = () => {
    router.push(`/providers/${post.provider_id}/posts/${post.id}`);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      {provider && (
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.full_name || 'Provider'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                <span className="text-brand-600 dark:text-brand-400 font-medium">
                  {(provider.business_name || provider.full_name || 'P')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {provider.business_name || provider.full_name}
                </p>
                {provider.is_verified && (
                  <VerifiedBadge isVerified={true} size="sm" showLabel={false} />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {isOwner && showActions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Media */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
        {post.type === 'carousel' && post.media_urls.length > 1 ? (
          <div className="relative w-full h-full">
            <img
              src={post.media_urls[0]}
              alt={post.alt_text || 'Post image'}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
              1/{post.media_urls.length}
            </div>
          </div>
        ) : post.type === 'video' ? (
          <video
            src={post.media_urls[0]}
            poster={post.thumbnail_url || undefined}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={post.media_urls[0]}
            alt={post.alt_text || 'Post image'}
            className="w-full h-full object-cover"
          />
        )}

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {!post.is_active && (
            <Badge variant="solid" color="dark" size="sm">
              Inactive
            </Badge>
          )}
          {post.moderation_status === 'pending' && (
            <Badge variant="solid" color="warning" size="sm">
              Pending Review
            </Badge>
          )}
          {post.moderation_status === 'rejected' && (
            <Badge variant="solid" color="error" size="sm">
              Rejected
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center gap-1.5 transition-colors ${
                liked
                  ? 'text-red-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
              }`}
            >
              <svg
                className="w-6 h-6"
                fill={liked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        )}

        {/* Stats */}
        <PostEngagementStats
          likes_count={likesCount}
          comments_count={post.comments_count}
          views_count={post.views_count}
          variant="compact"
        />

        {/* Caption */}
        {post.caption && (
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {post.caption}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderPostCard;
