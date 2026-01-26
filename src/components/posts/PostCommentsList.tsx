"use client";
import React, { useState, useEffect } from "react";
import { PostComment, PostCommentWithUser } from "@/types/posts";
import { getPostComments, commentOnPost } from "@/app/actions/posts";

interface PostCommentsListProps {
  postId: string;
  initialComments?: PostCommentWithUser[];
  initialTotal?: number;
}

const PostCommentsList: React.FC<PostCommentsListProps> = ({
  postId,
  initialComments = [],
  initialTotal = 0,
}) => {
  const [comments, setComments] = useState<PostCommentWithUser[]>(initialComments);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async (pageNum: number) => {
    setLoading(true);
    const result = await getPostComments({ postId, page: pageNum, limit: 10 });
    
    if (result.success) {
      if (pageNum === 1) {
        setComments(result.comments || []);
      } else {
        setComments(prev => [...prev, ...(result.comments || [])]);
      }
      setTotal(result.total || 0);
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setError(null);
    setSubmitting(true);

    const result = await commentOnPost(postId, newComment);

    if (result.success) {
      setNewComment('');
      // Reload comments
      await loadComments(1);
      setPage(1);
    } else {
      setError(result.error || 'Failed to post comment');
    }

    setSubmitting(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage);
  };

  const hasMore = comments.length < total;

  return (
    <div className="space-y-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            maxLength={500}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {newComment.length}/500
          </span>
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Comments ({total})
          </h3>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                {comment.user_avatar ? (
                  <img
                    src={comment.user_avatar}
                    alt={comment.user_name || 'User'}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {(comment.user_name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.user_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words">
                      {comment.comment}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load more comments'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PostCommentsList;
