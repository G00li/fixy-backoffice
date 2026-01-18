'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Login with email and password
 * All authenticated users can access the dashboard
 * Role-based access control is handled at the page/component level
 */
export async function login(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Authentication failed' };
  }

  // All authenticated users can access the dashboard
  // Role-based permissions are checked at the component/page level
  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Logout current user
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/signin');
}

/**
 * Get current authenticated user with profile
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  // Get user profile and role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, user_roles(role)')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return { user, profile: null, role: null };
  }

  return {
    user,
    profile,
    role: (profile as any)?.user_roles?.role || null,
  };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
