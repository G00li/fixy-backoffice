"use client";
import React from "react";

interface PostEngagementStatsProps {
  likes_count: number;
  comments_count: number;
  views_count: number;
  shares_count?: number;
  variant?: "compact" | "detailed";
}

const PostEngagementStats: React.FC<PostEngagementStatsProps> = ({
  likes_count,
  comments_count,
  views_count,
  shares_count = 0,
  variant = "compact",
}) => {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span>{formatCount(likes_count)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <span>{formatCount(comments_count)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span>{formatCount(views_count)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <svg className="w-6 h-6 mb-2 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        <span className="text-2xl font-bold text-gray-800 dark:text-white">{formatCount(likes_count)}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Likes</span>
      </div>

      <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <svg className="w-6 h-6 mb-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
        <span className="text-2xl font-bold text-gray-800 dark:text-white">{formatCount(comments_count)}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Comments</span>
      </div>

      <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <svg className="w-6 h-6 mb-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        <span className="text-2xl font-bold text-gray-800 dark:text-white">{formatCount(views_count)}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Views</span>
      </div>

      {shares_count > 0 && (
        <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg className="w-6 h-6 mb-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{formatCount(shares_count)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Shares</span>
        </div>
      )}
    </div>
  );
};

export default PostEngagementStats;
