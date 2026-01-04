'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Types
export interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  business_name: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  bio: string | null;
  social_media: any;
  is_verified: boolean | null;
  verified_at: string | null;
  role: string | null;
  role_assigned_at: string | null;
  created_at: string | null;
}

export interface CreateUserParams {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'support' | 'provider';
  phone?: string;
}

export interface UpdateUserParams {
  userId: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateUserRoleParams {
  userId: string;
  newRole: string;
}

// Get current user
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { success: false, error: 'Failed to get current user' };
  }
}

// Get current user profile with role
export async function getCurrentUserProfile() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users_with_roles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { success: false, error: 'Failed to fetch profile' };
    }

    return { success: true, profile: profile as UserWithRole };
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get user profile by ID (respects permissions)
export async function getUserProfile(userId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is viewing their own profile or has permissions
    const isOwnProfile = user.id === userId;
    
    if (!isOwnProfile) {
      // Check if user has permission to view other profiles
      const { data: hasPermission } = await supabase.rpc('is_support_or_above', {
        user_id: user.id
      });

      if (!hasPermission) {
        return { success: false, error: 'Insufficient permissions' };
      }
    }

    // Get profile with role
    const { data: profile, error } = await supabase
      .from('users_with_roles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: 'User not found' };
    }

    // Check if current user can view this profile (super_admin check)
    if (!isOwnProfile && profile.role === 'super_admin') {
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
        user_id: user.id
      });

      if (!isSuperAdmin) {
        return { success: false, error: 'Insufficient permissions' };
      }
    }

    return { success: true, profile: profile as UserWithRole };
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Upload avatar to Supabase Storage
export async function uploadAvatar(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const file = formData.get('avatar') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' };
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 2MB' };
    }

    // Get current avatar to delete later
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}.${fileExt}`;

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return { success: false, error: 'Failed to upload avatar' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      // Try to delete uploaded file
      await supabase.storage.from('avatars').remove([fileName]);
      return { success: false, error: 'Failed to update profile' };
    }

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      try {
        const oldPath = profile.avatar_url.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      } catch (error) {
        // Ignore errors when deleting old avatar
        console.log('Could not delete old avatar:', error);
      }
    }

    revalidatePath('/profile');
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Unexpected error uploading avatar:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Upload cover image to Supabase Storage
export async function uploadCoverImage(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const file = formData.get('cover') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' };
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    // Get current cover image to delete later
    const { data: profile } = await supabase
      .from('profiles')
      .select('cover_image_url')
      .eq('id', user.id)
      .single();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${user.id}/cover_${timestamp}.${fileExt}`;

    // Upload file to post-images bucket (reusing existing bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(`covers/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading cover image:', uploadError);
      return { success: false, error: 'Failed to upload cover image' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(`covers/${fileName}`);

    // Update profile with new cover image URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        cover_image_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      // Try to delete uploaded file
      await supabase.storage.from('post-images').remove([`covers/${fileName}`]);
      return { success: false, error: 'Failed to update profile' };
    }

    // Delete old cover image if exists
    if (profile?.cover_image_url) {
      try {
        const oldPath = profile.cover_image_url.split('/post-images/')[1];
        if (oldPath) {
          await supabase.storage.from('post-images').remove([oldPath]);
        }
      } catch (error) {
        // Ignore errors when deleting old cover image
        console.log('Could not delete old cover image:', error);
      }
    }

    revalidatePath('/profile');
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Unexpected error uploading cover image:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete avatar from Supabase Storage
export async function deleteAvatar() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get current avatar
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    if (!profile?.avatar_url) {
      return { success: false, error: 'No avatar to delete' };
    }

    // Extract file path from URL
    const filePath = profile.avatar_url.split('/avatars/')[1];
    if (!filePath) {
      return { success: false, error: 'Invalid avatar URL' };
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting avatar:', deleteError);
      return { success: false, error: 'Failed to delete avatar' };
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return { success: false, error: 'Failed to update profile' };
    }

    revalidatePath('/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting avatar:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete cover image from Supabase Storage
export async function deleteCoverImage() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get current cover image
    const { data: profile } = await supabase
      .from('profiles')
      .select('cover_image_url')
      .eq('id', user.id)
      .single();

    if (!profile?.cover_image_url) {
      return { success: false, error: 'No cover image to delete' };
    }

    // Extract file path from URL
    const filePath = profile.cover_image_url.split('/post-images/')[1];
    if (!filePath) {
      return { success: false, error: 'Invalid cover image URL' };
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('post-images')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting cover image:', deleteError);
      return { success: false, error: 'Failed to delete cover image' };
    }

    // Update profile to remove cover image URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        cover_image_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return { success: false, error: 'Failed to update profile' };
    }

    revalidatePath('/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting cover image:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Check if username is available
export async function checkUsernameAvailability(username: string) {
  try {
    // Use supabaseAdmin to bypass RLS and avoid recursion issues
    // This is safe because we're only checking username availability (public info)
    
    // Validate username format
    const usernameRegex = /^[a-z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return { 
        success: false, 
        available: false,
        error: 'Username must be 3-30 characters (lowercase letters, numbers, underscore, hyphen)' 
      };
    }

    // Check if username exists using admin client to avoid RLS recursion
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Error checking username:', error);
      return { success: false, available: false, error: 'Failed to check username' };
    }

    return { success: true, available: !data };
  } catch (error) {
    console.error('Unexpected error checking username:', error);
    return { success: false, available: false, error: 'An unexpected error occurred' };
  }
}

// Update own profile
export async function updateOwnProfile(params: {
  fullName?: string;
  displayName?: string;
  businessName?: string;
  username?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  socialMedia?: any;
  postalCode?: string;
  locationText?: string;
  address?: any;
}) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // If username is being updated, validate it
    if (params.username !== undefined) {
      // Validate format
      const usernameRegex = /^[a-z0-9_-]{3,30}$/;
      if (!usernameRegex.test(params.username)) {
        return { 
          success: false, 
          error: 'Username must be 3-30 characters (lowercase letters, numbers, underscore, hyphen)' 
        };
      }

      // Check if username is already taken by another user (using admin to avoid RLS recursion)
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', params.username)
        .neq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'Username is already taken' };
      }
    }

    // Build update object
    const updateData: any = { updated_at: new Date().toISOString() };
    if (params.fullName !== undefined) updateData.full_name = params.fullName;
    if (params.displayName !== undefined) updateData.display_name = params.displayName;
    if (params.businessName !== undefined) updateData.business_name = params.businessName;
    if (params.username !== undefined) updateData.username = params.username;
    if (params.phone !== undefined) updateData.phone = params.phone;
    if (params.bio !== undefined) updateData.bio = params.bio;
    if (params.avatarUrl !== undefined) updateData.avatar_url = params.avatarUrl;
    if (params.coverImageUrl !== undefined) updateData.cover_image_url = params.coverImageUrl;
    if (params.socialMedia !== undefined) updateData.social_media = params.socialMedia;
    if (params.postalCode !== undefined) updateData.postal_code = params.postalCode;
    if (params.locationText !== undefined) updateData.location_text = params.locationText;
    if (params.address !== undefined) updateData.address = params.address;

    // Update profile using admin client to avoid RLS recursion
    // This is safe because we verified the user is authenticated and owns this profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      
      // Check if it's a unique constraint violation
      if (updateError.code === '23505') {
        return { success: false, error: 'Username is already taken' };
      }
      
      return { success: false, error: 'Failed to update profile' };
    }

    revalidatePath('/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get user list with pagination and filters
export async function getUserList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin_or_above', {
      user_id: user.id
    });

    if (!isAdmin) {
      return { success: false, error: 'Insufficient permissions' };
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('users_with_roles')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (params?.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    // Apply role filter
    if (params?.role) {
      query = query.eq('role', params.role);
    }

    // Check if user is super_admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
      user_id: user.id
    });

    // If not super_admin, exclude super_admins from results
    if (!isSuperAdmin) {
      query = query.neq('role', 'super_admin');
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: 'Failed to fetch users' };
    }

    return {
      success: true,
      users: users as UserWithRole[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('Unexpected error fetching users:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get user detail
export async function getUserDetail(userId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin_or_above', {
      user_id: user.id
    });

    if (!isAdmin) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Get user with role
    const { data: userDetail, error } = await supabase
      .from('users_with_roles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user detail:', error);
      return { success: false, error: 'User not found' };
    }

    // Check if current user can view this user
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
      user_id: user.id
    });

    if (!isSuperAdmin && userDetail.role === 'super_admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    return { success: true, user: userDetail as UserWithRole };
  } catch (error) {
    console.error('Unexpected error fetching user detail:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Create user
export async function createUser(params: CreateUserParams) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate permissions using database function
    const { data: canCreate, error: permError } = await supabase.rpc('can_create_role', {
      p_creator_id: user.id,
      p_target_role: params.role
    });

    if (permError || !canCreate) {
      return { success: false, error: 'Insufficient permissions to create this role' };
    }

    // Validate input
    if (!params.email || !params.password || !params.fullName) {
      return { success: false, error: 'All fields are required' };
    }

    if (params.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: params.email,
      password: params.password,
      email_confirm: true,
      user_metadata: {
        full_name: params.fullName,
      },
    });

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      return { success: false, error: authError?.message || 'Failed to create user' };
    }

    const newUserId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,
        email: params.email,
        full_name: params.fullName,
        phone: params.phone || null,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return { success: false, error: 'Failed to create user profile' };
    }

    // Assign role using UPSERT to handle the case where trigger already created a default role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: newUserId,
        role: params.role,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Rollback: delete profile and auth user
      await supabaseAdmin.from('profiles').delete().eq('id', newUserId);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return { success: false, error: 'Failed to assign role' };
    }

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action_type: 'create_user',
      p_target_user_id: newUserId,
      p_target_role: params.role,
      p_new_data: {
        email: params.email,
        full_name: params.fullName,
        role: params.role,
      },
    });

    // If admin creates support, notify super admins
    const { data: creatorRole } = await supabase.rpc('get_user_role', {
      user_id: user.id
    });

    if (creatorRole === 'admin' && params.role === 'support') {
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      await supabase.rpc('notify_super_admins', {
        p_title: 'New Support User Created',
        p_message: `Admin ${creatorProfile?.full_name || creatorProfile?.email} created a new support user: ${params.email}`,
        p_notification_type: 'user_created',
        p_data: {
          created_by: user.id,
          created_by_name: creatorProfile?.full_name,
          new_user_id: newUserId,
          new_user_email: params.email,
          role: params.role,
        },
        p_priority: 'medium',
      });
    }

    revalidatePath('/users');
    
    return { success: true, userId: newUserId };
  } catch (error) {
    console.error('Unexpected error creating user:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update user profile
export async function updateUser(params: UpdateUserParams) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user can manage target user
    const { data: canManage } = await supabase.rpc('can_manage_user', {
      p_manager_id: user.id,
      p_target_user_id: params.userId
    });

    if (!canManage) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Get previous data
    const { data: previousData } = await supabase
      .from('profiles')
      .select('full_name, phone, bio, avatar_url')
      .eq('id', params.userId)
      .single();

    // Update profile
    const updateData: any = {};
    if (params.fullName !== undefined) updateData.full_name = params.fullName;
    if (params.phone !== undefined) updateData.phone = params.phone;
    if (params.bio !== undefined) updateData.bio = params.bio;
    if (params.avatarUrl !== undefined) updateData.avatar_url = params.avatarUrl;
    updateData.updated_at = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', params.userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return { success: false, error: 'Failed to update user' };
    }

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action_type: 'update_profile',
      p_target_user_id: params.userId,
      p_previous_data: previousData,
      p_new_data: updateData,
    });

    revalidatePath('/users');
    revalidatePath(`/users/${params.userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating user:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update user role
export async function updateUserRole(params: UpdateUserRoleParams) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user can manage target user
    const { data: canManage } = await supabase.rpc('can_manage_user', {
      p_manager_id: user.id,
      p_target_user_id: params.userId
    });

    if (!canManage) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Check if user can create this role
    const { data: canCreate } = await supabase.rpc('can_create_role', {
      p_creator_id: user.id,
      p_target_role: params.newRole
    });

    if (!canCreate) {
      return { success: false, error: 'Insufficient permissions to assign this role' };
    }

    // Get previous role
    const { data: previousRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', params.userId)
      .single();

    // Update role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .update({
        role: params.newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', params.userId);

    if (roleError) {
      console.error('Error updating role:', roleError);
      return { success: false, error: 'Failed to update role' };
    }

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action_type: 'update_role',
      p_target_user_id: params.userId,
      p_target_role: params.newRole,
      p_previous_data: { role: previousRole?.role },
      p_new_data: { role: params.newRole },
    });

    // Notify the user about role change
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', params.userId)
      .single();

    await supabase.rpc('notify_user', {
      p_recipient_id: params.userId,
      p_title: 'Role Updated',
      p_message: `Your role has been updated to ${params.newRole}`,
      p_notification_type: 'role_changed',
      p_data: {
        previous_role: previousRole?.role,
        new_role: params.newRole,
        changed_by: user.id,
      },
      p_priority: 'high',
    });

    revalidatePath('/users');
    revalidatePath(`/users/${params.userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating role:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete user
export async function deleteUser(userId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Only super_admin can delete users
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
      user_id: user.id
    });

    if (!isSuperAdmin) {
      return { success: false, error: 'Only super admins can delete users' };
    }

    // Get user data before deletion
    const { data: userData } = await supabase
      .from('users_with_roles')
      .select('*')
      .eq('id', userId)
      .single();

    // Cannot delete super_admin
    if (userData?.role === 'super_admin') {
      return { success: false, error: 'Cannot delete super admin users' };
    }

    // Cannot delete yourself
    if (userId === user.id) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    // Delete role
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);

    // Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      return { success: false, error: 'Failed to delete user' };
    }

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_admin_id: user.id,
      p_action_type: 'delete_user',
      p_target_user_id: userId,
      p_target_role: userData?.role || undefined,
      p_previous_data: userData,
    });

    revalidatePath('/users');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting user:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get audit log for a user
export async function getUserAuditLog(userId: string, limit = 50) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin_or_above', {
      user_id: user.id
    });

    if (!isAdmin) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Get audit log using admin client (permissions already validated)
    const { data: logs, error } = await supabaseAdmin
      .from('admin_actions_log')
      .select('*')
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit log:', error);
      return { success: false, error: 'Failed to fetch audit log' };
    }

    return { success: true, logs };
  } catch (error) {
    console.error('Unexpected error fetching audit log:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Reset user password by admin (super-admin only)
export async function resetUserPasswordByAdmin(params: {
  targetUserId: string;
  newPassword?: string;
  generateTemporary?: boolean;
}) {
  try {
    const supabase = await createClient();
    
    // Get current user (admin)
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if admin is super_admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
      user_id: admin.id
    });

    if (!isSuperAdmin) {
      return { success: false, error: 'Only super admins can reset user passwords' };
    }

    // Get target user info
    const { data: targetUser } = await supabase
      .from('users_with_roles')
      .select('*')
      .eq('id', params.targetUserId)
      .single();

    if (!targetUser) {
      return { success: false, error: 'Target user not found' };
    }

    // Cannot reset password of another super_admin
    if (targetUser.role === 'super_admin') {
      return { success: false, error: 'Cannot reset password of another super admin' };
    }

    // Validate password
    if (!params.newPassword) {
      return { success: false, error: 'Password is required' };
    }
    
    if (params.newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    const passwordToSet = params.newPassword;
    const isTemporary = params.generateTemporary || false;

    // Update password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      params.targetUserId,
      { password: passwordToSet }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return { success: false, error: 'Failed to update password' };
    }

    // Update profile with password expiration flags
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        password_is_temporary: isTemporary,
        password_expires_at: isTemporary ? new Date().toISOString() : null, // Expire immediately if temporary
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.targetUserId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't fail the whole operation, just log
    }

    // Log the action
    await supabase.rpc('log_admin_action', {
      p_admin_id: admin.id,
      p_action_type: 'reset_user_password',
      p_target_user_id: params.targetUserId,
      p_target_role: targetUser.role ?? undefined,
      p_new_data: {
        password_changed: true,
        forced_by_admin: true,
        admin_email: admin.email,
        is_temporary: isTemporary,
      },
    });

    // Notify the user
    await supabase.rpc('notify_user', {
      p_recipient_id: params.targetUserId,
      p_title: 'Password Changed by Administrator',
      p_message: isTemporary 
        ? 'Your password was reset by an administrator with a temporary password. You must change it on your next login.'
        : 'Your password was reset by an administrator. Please log in with your new password and consider changing it to something you\'ll remember.',
      p_notification_type: 'security_alert',
      p_data: {
        changed_by_admin: true,
        admin_id: admin.id,
        is_temporary: isTemporary,
      },
      p_priority: 'high',
    });

    return { 
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error resetting user password:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Reset own password
export async function resetOwnPassword(params: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input
    if (!params.currentPassword || !params.newPassword) {
      return { success: false, error: 'All fields are required' };
    }

    if (params.newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' };
    }

    if (params.currentPassword === params.newPassword) {
      return { success: false, error: 'New password must be different from current password' };
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: params.currentPassword,
    });

    if (signInError) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: params.newPassword,
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return { success: false, error: 'Failed to update password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error resetting password:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Change expired password
export async function changeExpiredPassword(params: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if password is expired
    const { data: hasExpired } = await supabase.rpc('has_expired_password', {
      user_id: user.id
    });

    if (!hasExpired) {
      return { success: false, error: 'Password is not expired' };
    }

    // Validate input
    if (!params.currentPassword || !params.newPassword) {
      return { success: false, error: 'All fields are required' };
    }

    if (params.newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' };
    }

    if (params.currentPassword === params.newPassword) {
      return { success: false, error: 'New password must be different from current password' };
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: params.currentPassword,
    });

    if (signInError) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: params.newPassword,
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return { success: false, error: 'Failed to update password' };
    }

    // Mark password as changed (removes temporary and expiration flags)
    await supabase.rpc('mark_password_changed', {
      user_id: user.id
    });

    return { success: true };
  } catch (error) {
    console.error('Unexpected error changing expired password:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Check if current user has expired password
export async function checkPasswordExpiration() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, hasExpired: false };
    }

    // Check if password is expired
    const { data: hasExpired } = await supabase.rpc('has_expired_password', {
      user_id: user.id
    });

    return { success: true, hasExpired: hasExpired || false };
  } catch (error) {
    console.error('Unexpected error checking password expiration:', error);
    return { success: false, hasExpired: false };
  }
}
