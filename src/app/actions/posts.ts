'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import {
  CreatePostParams,
  UpdatePostParams,
  ProviderPost,
  PostWithProvider,
  PostComment,
  POST_VALIDATION,
} from '@/types/posts';

// Validation helper
function sanitizeCaption(caption: string): string {
  // Remove script tags and sanitize
  return caption
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .trim();
}

// Create provider post
export async function createProviderPost(params: CreatePostParams) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is a provider
    const { data: isProvider } = await supabase.rpc('is_provider', {
      user_id: user.id
    });

    if (!isProvider) {
      return { success: false, error: 'Only providers can create posts' };
    }

    // Validate inputs
    if (!params.media_urls || params.media_urls.length === 0) {
      return { success: false, error: 'At least one media file is required' };
    }

    if (params.media_urls.length > POST_VALIDATION.MAX_MEDIA_FILES) {
      return { success: false, error: `Maximum ${POST_VALIDATION.MAX_MEDIA_FILES} media files allowed` };
    }

    if (params.caption && params.caption.length > POST_VALIDATION.MAX_CAPTION_LENGTH) {
      return { success: false, error: `Caption must be less than ${POST_VALIDATION.MAX_CAPTION_LENGTH} characters` };
    }

    if (params.tags && params.tags.length > POST_VALIDATION.MAX_TAGS) {
      return { success: false, error: `Maximum ${POST_VALIDATION.MAX_TAGS} tags allowed` };
    }

    // Sanitize caption
    const sanitizedCaption = params.caption ? sanitizeCaption(params.caption) : null;

    // Check daily post limit (rate limiting)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count } = await supabase
      .from('provider_posts')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', user.id)
      .gte('created_at', today.toISOString());

    const MAX_POSTS_PER_DAY = 20;
    if (count && count >= MAX_POSTS_PER_DAY) {
      return { success: false, error: 'Daily post limit reached. Please try again tomorrow.' };
    }

    // Create post
    const { data: post, error: createError } = await supabase
      .from('provider_posts')
      .insert({
        provider_id: user.id,
        type: params.type,
        media_urls: params.media_urls,
        thumbnail_url: params.thumbnail_url || null,
        caption: sanitizedCaption,
        service_id: params.service_id || null,
        tags: params.tags || [],
        alt_text: params.alt_text || null,
        is_active: true,
        moderation_status: 'approved', // Auto-approve for now
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating post:', createError);
      return { success: false, error: 'Failed to create post' };
    }

    revalidatePath('/providers/[id]/posts', 'page');
    
    return { success: true, post };
  } catch (error) {
    console.error('Unexpected error creating post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get provider posts with pagination
export async function getProviderPosts(params: {
  providerId: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}) {
  try {
    // Validate providerId
    if (!params.providerId || params.providerId === 'undefined') {
      console.error('Invalid providerId:', params.providerId);
      return {
        success: true,
        posts: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 20,
        totalPages: 0,
      };
    }

    const supabase = await createClient();
    
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('provider_posts')
      .select('*', { count: 'exact' })
      .eq('provider_id', params.providerId);

    // Only filter by moderation_status and is_active if not owner
    if (!params.includeInactive) {
      query = query
        .eq('is_active', true)
        .eq('moderation_status', 'approved');
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching posts:', error, 'Provider ID:', params.providerId);
      // Return empty array instead of error to allow page to load
      return {
        success: true,
        posts: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    return {
      success: true,
      posts: (posts || []) as ProviderPost[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('Unexpected error fetching posts:', error, 'Provider ID:', params.providerId);
    // Return empty array instead of error to allow page to load
    return {
      success: true,
      posts: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 20,
      totalPages: 0,
    };
  }
}

// Get post detail
export async function getPostDetail(postId: string) {
  try {
    const supabase = await createClient();
    
    const { data: post, error } = await supabase
      .from('provider_posts')
      .select(`
        *,
        provider:profiles!provider_posts_provider_id_fkey (
          id,
          full_name,
          business_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return { success: false, error: 'Post not found' };
    }

    // Increment view count (fire and forget)
    supabase
      .from('provider_posts')
      .update({ views_count: (post.views_count || 0) + 1 })
      .eq('id', postId)
      .then();

    return { success: true, post: post as PostWithProvider };
  } catch (error) {
    console.error('Unexpected error fetching post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update provider post
export async function updateProviderPost(params: UpdatePostParams) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user owns the post
    const { data: post } = await supabase
      .from('provider_posts')
      .select('provider_id')
      .eq('id', params.postId)
      .single();

    if (!post || post.provider_id !== user.id) {
      return { success: false, error: 'Post not found or unauthorized' };
    }

    // Validate inputs
    if (params.caption && params.caption.length > POST_VALIDATION.MAX_CAPTION_LENGTH) {
      return { success: false, error: `Caption must be less than ${POST_VALIDATION.MAX_CAPTION_LENGTH} characters` };
    }

    if (params.tags && params.tags.length > POST_VALIDATION.MAX_TAGS) {
      return { success: false, error: `Maximum ${POST_VALIDATION.MAX_TAGS} tags allowed` };
    }

    // Build update object
    const updateData: any = { updated_at: new Date().toISOString() };
    if (params.caption !== undefined) updateData.caption = sanitizeCaption(params.caption);
    if (params.service_id !== undefined) updateData.service_id = params.service_id;
    if (params.tags !== undefined) updateData.tags = params.tags;
    if (params.alt_text !== undefined) updateData.alt_text = params.alt_text;
    if (params.is_active !== undefined) updateData.is_active = params.is_active;

    // Update post
    const { error: updateError } = await supabase
      .from('provider_posts')
      .update(updateData)
      .eq('id', params.postId);

    if (updateError) {
      console.error('Error updating post:', updateError);
      return { success: false, error: 'Failed to update post' };
    }

    revalidatePath('/providers/[id]/posts', 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete provider post
export async function deleteProviderPost(postId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user owns the post
    const { data: post } = await supabase
      .from('provider_posts')
      .select('provider_id, media_urls')
      .eq('id', postId)
      .single();

    if (!post || post.provider_id !== user.id) {
      return { success: false, error: 'Post not found or unauthorized' };
    }

    // Delete post (cascade will handle likes and comments)
    const { error: deleteError } = await supabase
      .from('provider_posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return { success: false, error: 'Failed to delete post' };
    }

    // Delete media files from storage (fire and forget)
    if (post.media_urls && post.media_urls.length > 0) {
      const filePaths = post.media_urls
        .map(url => url.split('/post-images/')[1])
        .filter(Boolean);
      
      if (filePaths.length > 0) {
        supabase.storage
          .from('post-images')
          .remove(filePaths)
          .then();
      }
    }

    revalidatePath('/providers/[id]/posts', 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Like post
export async function likePost(postId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      return { success: false, error: 'Already liked' };
    }

    // Create like
    const { error: likeError } = await supabase
      .from('post_likes')
      .insert({
        user_id: user.id,
        post_id: postId,
      });

    if (likeError) {
      console.error('Error liking post:', likeError);
      return { success: false, error: 'Failed to like post' };
    }

    revalidatePath('/providers/[id]/posts', 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error liking post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Unlike post
export async function unlikePost(postId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Delete like
    const { error: unlikeError } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    if (unlikeError) {
      console.error('Error unliking post:', unlikeError);
      return { success: false, error: 'Failed to unlike post' };
    }

    revalidatePath('/providers/[id]/posts', 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error unliking post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Check if user liked post
export async function checkIfLiked(postId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true, liked: false };
    }

    const { data: like } = await supabase
      .from('post_likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    return { success: true, liked: !!like };
  } catch (error) {
    console.error('Unexpected error checking like:', error);
    return { success: true, liked: false };
  }
}

// Comment on post
export async function commentOnPost(postId: string, comment: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate comment
    if (!comment || comment.trim().length === 0) {
      return { success: false, error: 'Comment cannot be empty' };
    }

    if (comment.length > 500) {
      return { success: false, error: 'Comment must be less than 500 characters' };
    }

    // Sanitize comment
    const sanitizedComment = sanitizeCaption(comment);

    // Create comment
    const { error: commentError } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        comment: sanitizedComment,
      });

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return { success: false, error: 'Failed to create comment' };
    }

    revalidatePath('/providers/[id]/posts', 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error creating comment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get post comments with pagination
export async function getPostComments(params: {
  postId: string;
  page?: number;
  limit?: number;
}) {
  try {
    const supabase = await createClient();
    
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    const { data: comments, error, count } = await supabase
      .from('post_comments')
      .select(`
        *,
        user:profiles!post_comments_user_id_fkey (
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('post_id', params.postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      return { success: false, error: 'Failed to fetch comments' };
    }

    return {
      success: true,
      comments: comments as PostComment[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('Unexpected error fetching comments:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Upload post media
export async function uploadPostMedia(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is a provider
    const { data: isProvider } = await supabase.rpc('is_provider', {
      user_id: user.id
    });

    if (!isProvider) {
      return { success: false, error: 'Only providers can upload media' };
    }

    const file = formData.get('media') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const isImage = POST_VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = POST_VALIDATION.ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return { success: false, error: 'Invalid file type. Only images and videos are allowed' };
    }

    // Validate file size
    const maxSize = isImage ? POST_VALIDATION.MAX_IMAGE_SIZE : POST_VALIDATION.MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return { success: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const bucket = isImage ? 'post-images' : 'post-videos';
    const fileName = `providers/${user.id}/${timestamp}_${randomStr}.${fileExt}`;

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading media:', uploadError);
      return { success: false, error: 'Failed to upload media' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl, type: isImage ? 'image' : 'video' };
  } catch (error) {
    console.error('Unexpected error uploading media:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
