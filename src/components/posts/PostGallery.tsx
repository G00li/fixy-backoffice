"use client";
import React, { useState } from "react";
import { ProviderPost, PostWithProvider } from "@/types/posts";
import ProviderPostCard from "./ProviderPostCard";

interface PostGalleryProps {
  posts: (ProviderPost | PostWithProvider)[];
  isOwner?: boolean;
  onPostDelete?: (postId: string) => void;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const PostGallery: React.FC<PostGalleryProps> = ({
  posts,
  isOwner = false,
  onPostDelete,
  loading = false,
  hasMore = false,
  onLoadMore,
}) => {
  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
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
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No posts yet
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {isOwner
            ? 'Start sharing your work by creating your first post.'
            : 'This provider hasn\'t posted anything yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <ProviderPostCard
            key={post.id}
            post={post}
            isOwner={isOwner}
            onDelete={() => onPostDelete?.(post.id)}
          />
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more button */}
      {hasMore && !loading && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Load More Posts
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PostGallery;
