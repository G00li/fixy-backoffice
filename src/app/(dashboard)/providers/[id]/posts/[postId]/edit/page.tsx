import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/users';
import { getPostDetail } from '@/app/actions/posts';
import ProviderPostForm from '@/components/posts/ProviderPostForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Edit Post | Fixy Backoffice',
  description: 'Edit your post',
};

interface PageProps {
  params: {
    id: string;
    postId: string;
  };
}

export default async function EditPostPage({ params }: PageProps) {
  // Get current user
  const { user } = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const providerId = params.id;
  const postId = params.postId;

  // Check if user is the provider
  if (user.id !== providerId) {
    redirect(`/providers/${providerId}/posts`);
  }

  // Get post details
  const result = await getPostDetail(postId);

  if (!result.success || !result.post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            {result.error || 'Post not found'}
          </p>
        </div>
        <Link
          href={`/providers/${providerId}/posts`}
          className="mt-4 inline-flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Posts
        </Link>
      </div>
    );
  }

  const post = result.post;

  // Verify ownership
  if (post.provider_id !== user.id) {
    redirect(`/providers/${providerId}/posts`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/providers/${providerId}/posts`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Post
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update your post details
          </p>
        </div>
      </div>

      {/* Current Media Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Current Media
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {post.media_urls.map((url, index) => (
            <div key={index} className="relative aspect-square">
              {post.type === 'video' ? (
                <video
                  src={url}
                  poster={post.thumbnail_url || undefined}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Note: Media files cannot be changed after creation. You can only update the caption, tags, and service link.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <ProviderPostForm
          mode="edit"
          initialData={{
            id: post.id,
            caption: post.caption || undefined,
            service_id: post.service_id || undefined,
            tags: post.tags || [],
            media_urls: post.media_urls,
            type: post.type,
          }}
          providerId={providerId}
          onCancel={() => {
            // This will be handled by client-side navigation
          }}
        />
      </div>
    </div>
  );
}
