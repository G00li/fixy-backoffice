import PostFeedSkeleton from '@/components/posts/PostFeedSkeleton';

export default function FeedLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />

      {/* Posts Skeleton */}
      <PostFeedSkeleton count={6} />
    </div>
  );
}
