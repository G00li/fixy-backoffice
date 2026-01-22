import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUserWithRole } from '@/app/actions/permissions';
import { getPostDetail } from '@/app/actions/posts';
import ProviderPostForm from '@/components/posts/ProviderPostForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Edit Post | Fixy Backoffice',
  description: 'Edit your post',
};

interface PageProps {
  params: {
    postId: string;
  };
}

export default async function EditPostPage({ params }: PageProps) {
  // Await params in Next.js 15+
  const { postId } = await params;
  
  const { user } = await getCurrentUserWithRole();
  
  if (!user) {
    redirect('/signin');
  }

  if (user.role !== 'provider') {
    redirect('/');
  }

  // Fetch post details
  const result = await getPostDetail(postId);
  
  if (!result.success || !result.post) {
    notFound();
  }

  const post = result.post;

  // Check if user owns this post
  if (post.provider_id !== user.id) {
    redirect('/provider/posts');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/provider/posts/${post.id}`}
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
          Note: Media files cannot be changed after creation. You can only update the caption and tags.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <ProviderPostForm
          mode="edit"
          initialData={{
            id: post.id,
            caption: post.caption || undefined,
            tags: post.tags || [],
            media_urls: post.media_urls,
            type: post.type,
          }}
          providerId={user.id}
        />
      </div>
    </div>
  );
}
