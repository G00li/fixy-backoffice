interface PostFeedSkeletonProps {
  count?: number;
}

export default function PostFeedSkeleton({ count = 6 }: PostFeedSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          {/* Provider Info Skeleton */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          </div>

          {/* Image Skeleton */}
          <div className="aspect-square bg-gray-200 dark:bg-gray-700" />

          {/* Actions Skeleton */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
