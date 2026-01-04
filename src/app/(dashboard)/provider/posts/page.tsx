import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getCurrentUserWithRole } from '@/app/actions/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon } from '@/icons';

export const metadata: Metadata = {
  title: 'My Posts | Fixy Backoffice',
  description: 'Manage your portfolio posts',
};

export default async function ProviderPostsPage() {
  const { user } = await getCurrentUserWithRole();
  
  if (!user) {
    redirect('/signin');
  }

  if (user.role !== 'provider') {
    redirect('/');
  }

  return (
    <ProtectedRoute requiredRole="provider">
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

        {/* Posts Grid - To be implemented with actual posts */}
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

        {/* Help Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Tips for great posts
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use high-quality images to showcase your work</li>
            <li>• Add detailed descriptions to help clients understand your services</li>
            <li>• Tag your posts with relevant services for better discoverability</li>
            <li>• Keep your portfolio updated with your latest work</li>
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}
