"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatePostParams, PostType, POST_VALIDATION } from "@/types/posts";
import { createProviderPost, updateProviderPost } from "@/app/actions/posts";
import PostMediaUploader from "./PostMediaUploader";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface ProviderPostFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    caption?: string;
    service_id?: string;
    tags?: string[];
    media_urls?: string[];
    type?: PostType;
  };
  providerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProviderPostForm: React.FC<ProviderPostFormProps> = ({
  mode,
  initialData,
  providerId,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mediaUrls, setMediaUrls] = useState<string[]>(initialData?.media_urls || []);
  const [mediaTypes, setMediaTypes] = useState<('image' | 'video')[]>([]);
  const [caption, setCaption] = useState(initialData?.caption || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [serviceId, setServiceId] = useState(initialData?.service_id || '');

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    setMediaUrls(prev => [...prev, url]);
    setMediaTypes(prev => [...prev, type]);
    setError(null);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
    setMediaTypes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    if (!tag) return;
    
    if (tags.length >= POST_VALIDATION.MAX_TAGS) {
      setError(`Maximum ${POST_VALIDATION.MAX_TAGS} tags allowed`);
      return;
    }
    
    if (tags.includes(tag)) {
      setError('Tag already added');
      return;
    }
    
    setTags(prev => [...prev, tag]);
    setTagInput('');
    setError(null);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (mode === 'create' && mediaUrls.length === 0) {
      setError('At least one media file is required');
      return;
    }

    if (caption.length > POST_VALIDATION.MAX_CAPTION_LENGTH) {
      setError(`Caption must be less than ${POST_VALIDATION.MAX_CAPTION_LENGTH} characters`);
      return;
    }

    setLoading(true);

    if (mode === 'create') {
      // Determine post type
      const hasVideo = mediaTypes.includes('video');
      const postType: PostType = hasVideo ? 'video' : mediaUrls.length > 1 ? 'carousel' : 'image';

      const params: CreatePostParams = {
        type: postType,
        media_urls: mediaUrls,
        caption: caption || undefined,
        service_id: serviceId || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      const result = await createProviderPost(params);

      if (!result.success) {
        setError(result.error || 'Failed to create post');
        setLoading(false);
        return;
      }

      router.push(`/providers/${providerId}/posts`);
      onSuccess?.();
    } else {
      // Edit mode
      const result = await updateProviderPost({
        postId: initialData!.id!,
        caption: caption || undefined,
        service_id: serviceId || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      if (!result.success) {
        setError(result.error || 'Failed to update post');
        setLoading(false);
        return;
      }

      router.push(`/providers/${providerId}/posts`);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Media Upload */}
      {mode === 'create' && (
        <div>
          <Label>Media Files *</Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Upload images or videos for your post
          </p>
          
          <PostMediaUploader
            onUploadComplete={handleMediaUpload}
            currentCount={mediaUrls.length}
            maxFiles={POST_VALIDATION.MAX_MEDIA_FILES}
          />

          {/* Media preview */}
          {mediaUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative group">
                  {mediaTypes[index] === 'video' ? (
                    <video
                      src={url}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
                    {mediaTypes[index]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Caption */}
      <div>
        <Label>Caption</Label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption for your post..."
          rows={4}
          maxLength={POST_VALIDATION.MAX_CAPTION_LENGTH}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Share details about your work, process, or results
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {caption.length}/{POST_VALIDATION.MAX_CAPTION_LENGTH}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Add tags to help people discover your post (max {POST_VALIDATION.MAX_TAGS})
        </p>
        
        <div className="flex gap-2">
          <Input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="e.g., plumbing, renovation"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Add
          </button>
        </div>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-brand-900 dark:hover:text-brand-100"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Service Link (Optional) */}
      <div>
        <Label>Link to Service (Optional)</Label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Connect this post to one of your services
        </p>
        <Input
          type="text"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          placeholder="Service ID (leave empty if not applicable)"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || (mode === 'create' && mediaUrls.length === 0)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            mode === 'create' ? 'Create Post' : 'Update Post'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProviderPostForm;
