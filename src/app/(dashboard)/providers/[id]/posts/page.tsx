import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/users';
import { getProviderPosts } from '@/app/actions/posts';
import { getProviderDetails } from '@/app/actions/search';
import PostGallery from '@/components/posts/PostGallery';
import ProviderNavigation from '@/components/providers/ProviderNavigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Posts | Fixy Backoffice',
  description: 'Manage your posts',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ProviderPostsPage({ params, searchParams }: PageProps) {
  // Get current user
  const { user } = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Await params (Next.js 15+)
  const { id: providerId } = await params;
  const { page: pageParam } = await searchParams;
  const isOwner = user.id === providerId;

  // Get provider details
  const providerResult = await getProviderDetails(providerId);
  const provider = providerResult.success ? providerResult.provider : null;

  // Get posts
  const page = parseInt(pageParam || '1');
  const result = await getProviderPosts({
    providerId,
    page,
    limit: 12,
    includeInactive: isOwner,
  });

  // Always show the page, even if there are no posts
  const { posts = [], total = 0, totalPages = 0 } = result;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <ProviderNavigation providerId={providerId} />

      {/* Provider Info Header */}
      {provider && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="flex items-center gap-4">
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.full_name || 'Provider'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {provider.business_name || provider.full_name || 'Provider'}
                </h2>
                {provider.is_verified && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {provider.bio && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {provider.bio}
                </p>
              )}
              {provider.location_text && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {provider.location_text}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
