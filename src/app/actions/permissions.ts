'use server';

import { createClient } from '@/lib/supabase/server';

// Types
export interface UserWithRole {
  id: string;
  email: string | null;
  role: string | null;
}

export interface PermissionCheck {
  canManageUsers: boolean;
  canAccessSupport: boolean;
  canManageProviders: boolean;
  canAccessAdmin: boolean;
  isProvider: boolean;
  isClient: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isSupport: boolean;
}

/**
 * Get current authenticated user with their role
 * Reuses existing SQL function: get_user_role()
 */
export async function getCurrentUserWithRole() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated', user: null };
    }

    // Get user role using existing SQL function
    const { data: role, error: roleError } = await supabase.rpc('get_user_role', {
      user_id: user.id,
    });

    if (roleError) {
      console.error('Error getting user role:', roleError);
      return { success: false, error: 'Failed to get user role', user: null };
    }

    const userWithRole: UserWithRole = {
      id: user.id,
      email: user.email || null,
      role: role || 'client',
    };

    return { success: true, user: userWithRole };
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return { success: false, error: 'An unexpected error occurred', user: null };
  }
}

/**
 * Check all permissions for current user
 * Reuses existing SQL functions: is_admin_or_above, is_support_or_above, is_provider, etc.
 */
export async function checkUserPermissions(): Promise<PermissionCheck> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        canManageUsers: false,
        canAccessSupport: false,
        canManageProviders: false,
        canAccessAdmin: false,
        isProvider: false,
        isClient: false,
        isSuperAdmin: false,
        isAdmin: false,
        isSupport: false,
      };
    }

    // Use existing SQL functions to check permissions
    const [
      { data: isSuperAdmin },
      { data: isAdmin },
      { data: isSupport },
      { data: isProvider },
      { data: isClient },
    ] = await Promise.all([
      supabase.rpc('is_super_admin', { user_id: user.id }),
      supabase.rpc('is_admin_or_above', { user_id: user.id }),
      supabase.rpc('is_support_or_above', { user_id: user.id }),
      supabase.rpc('is_provider', { user_id: user.id }),
      supabase.rpc('is_client', { user_id: user.id }),
    ]);

    return {
      // Admin permissions
      canManageUsers: isAdmin || false,
      canAccessAdmin: isAdmin || false,
      canManageProviders: isAdmin || false,
      
      // Support permissions
      canAccessSupport: isSupport || false,
      
      // Role checks
      isSuperAdmin: isSuperAdmin || false,
      isAdmin: isAdmin || false,
      isSupport: isSupport || false,
      isProvider: isProvider || false,
      isClient: isClient || false,
    };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return {
      canManageUsers: false,
      canAccessSupport: false,
      canManageProviders: false,
      canAccessAdmin: false,
      isProvider: false,
      isClient: false,
      isSuperAdmin: false,
      isAdmin: false,
      isSupport: false,
    };
  }
}

/**
 * Check if user has a specific role
 * Reuses existing SQL function: has_role()
 */
export async function hasRole(requiredRole: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, hasRole: false };
    }

    const { data, error } = await supabase.rpc('has_role', {
      user_id: user.id,
      required_role: requiredRole,
    });

    if (error) {
      console.error('Error checking role:', error);
      return { success: false, hasRole: false };
    }

    return { success: true, hasRole: data || false };
  } catch (error) {
    console.error('Unexpected error checking role:', error);
    return { success: false, hasRole: false };
  }
}

/**
 * Get redirect path based on user role
 */
export async function getDefaultRedirectPath(): Promise<string> {
  const { user } = await getCurrentUserWithRole();
  
  if (!user || !user.role) {
    return '/';
  }

  // Redirect based on role hierarchy
  switch (user.role) {
    case 'super_admin':
    case 'admin':
      return '/users'; // Admin dashboard
    case 'support':
      return '/'; // Support dashboard
    case 'provider':
      return '/'; // Provider dashboard
    case 'client':
      return '/profile'; // Client profile
    default:
      return '/';
  }
}
