import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/users';
import { getProviderPosts } from '@/app/actions/posts';
import PostGallery from '@/components/posts/PostGallery';
import ProviderNavigation from '@/components/providers/ProviderNavigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Posts | Fixy Backoffice',
  description: 'Manage your posts',
};

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function ProviderPostsPage({ params, searchParams }: PageProps) {
  // Get current user
  const { user } = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const providerId = params.id;
  const isOwner = user.id === providerId;

  // Get posts
  const page = parseInt(searchParams.page || '1');
  const result = await getProviderPosts({
    providerId,
    page,
    limit: 12,
    includeInactive: isOwner,
  });

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            {result.error || 'Failed to load posts'}
          </p>
        </div>
      </div>
    );
  }

  const { posts, total, totalPages } = result;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <ProviderNavigation providerId={providerId} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Posts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {total} {total === 1 ? 'post' : 'posts'} total
          </p>
        </div>

        {isOwner && (
          <Link
            href={`/providers/${providerId}/posts/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Post
          </Link>
        )}
      </div>

      {/* Posts Gallery */}
      <PostGallery
        posts={posts}
        isOwner={isOwner}
        hasMore={page < totalPages}
        onLoadMore={() => {
          // This will be handled by client-side navigation
        }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/providers/${providerId}/posts?page=${page - 1}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Link>
          )}

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={`/providers/${providerId}/posts?page=${page + 1}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
