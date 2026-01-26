import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUserWithRole } from '@/app/actions/permissions';
import { getPostDetail } from '@/app/actions/posts';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Post Details | Fixy Backoffice',
  description: 'View post details',
};

interface PageProps {
  params: {
    postId: string;
  };
}

export default async function PostDetailPage({ params }: PageProps) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/provider/posts"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Post Details
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage your post
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/provider/posts/${post.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Media */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
          {post.type === 'carousel' ? (
            <div className="grid grid-cols-2 gap-1 h-full">
              {post.media_urls?.slice(0, 4).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ))}
            </div>
          ) : post.type === 'video' ? (
            <video
              src={post.media_urls?.[0]}
              poster={post.thumbnail_url || undefined}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={post.media_urls?.[0]}
              alt={post.caption || 'Post image'}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Post Info */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              post.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {post.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {post.type}
            </span>
          </div>

          {/* Caption */}
          {post.caption && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Caption
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {post.caption}
              </p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {post.views_count || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Views
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {post.likes_count || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Likes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {post.comments_count || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Comments
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>
              Created: {new Date(post.created_at).toLocaleString()}
            </div>
            {post.updated_at && post.updated_at !== post.created_at && (
              <div>
                Updated: {new Date(post.updated_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
