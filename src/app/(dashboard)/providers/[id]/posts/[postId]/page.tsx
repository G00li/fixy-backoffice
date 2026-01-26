import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/users';
import { getPostDetail } from '@/app/actions/posts';
import PostEngagementStats from '@/components/posts/PostEngagementStats';
import PostCommentsList from '@/components/posts/PostCommentsList';
import VerifiedBadge from '@/components/ui/verified-badge/VerifiedBadge';
import Badge from '@/components/ui/badge/Badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Post Details | Fixy Backoffice',
  description: 'View post details',
};

interface PageProps {
  params: {
    id: string;
    postId: string;
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  // Get current user
  const { user } = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const providerId = params.id;
  const postId = params.postId;

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
  const isOwner = user.id === post.provider_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/providers/${providerId}/posts`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Posts
        </Link>

        {isOwner && (
          <Link
            href={`/providers/${providerId}/posts/${postId}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Post
          </Link>
        )}
      </div>

      {/* Post Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Provider Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {post.provider_avatar ? (
              <img
                src={post.provider_avatar}
                alt={post.provider_name || 'Provider'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                <span className="text-brand-600 dark:text-brand-400 font-medium text-lg">
                  {(post.provider_name || 'P')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {post.provider_name}
                </p>
                {post.provider_is_verified && (
                  <VerifiedBadge isVerified={true} size="sm" showLabel={false} />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Status badges */}
          {(!post.is_active || post.moderation_status !== 'approved') && (
            <div className="mt-4 flex gap-2">
              {!post.is_active && (
                <Badge variant="solid" color="dark" size="sm">
                  Inactive
                </Badge>
              )}
              {post.moderation_status === 'pending' && (
                <Badge variant="solid" color="warning" size="sm">
                  Pending Review
                </Badge>
              )}
              {post.moderation_status === 'rejected' && (
                <Badge variant="solid" color="error" size="sm">
                  Rejected
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Media Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {post.media_urls?.map((url, index) => (
            <div key={index} className="relative aspect-square bg-gray-100 dark:bg-gray-900">
              {post.type === 'video' ? (
                <video
                  src={url}
                  poster={post.thumbnail_url || undefined}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={url}
                  alt={post.alt_text || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Engagement Stats */}
          <PostEngagementStats
            likes_count={post.likes_count}
            comments_count={post.comments_count}
            views_count={post.views_count}
            shares_count={post.shares_count}
            variant="detailed"
          />

          {/* Caption */}
          {post.caption && (
            <div>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {post.caption}
              </p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Service Link */}
          {post.service_id && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Related Service
              </p>
              <Link
                href={`/services/${post.service_id}`}
                className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                View Service Details →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <PostCommentsList postId={postId} />
      </div>
    </div>
  );
}
