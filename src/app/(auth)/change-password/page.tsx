import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export const metadata = {
  title: "Change Password - Fixy Backoffice",
  description: "Change your expired password",
};

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  // Check if password is actually expired
  const { data: hasExpired } = await supabase.rpc('has_expired_password', {
    user_id: user.id
  });

  // If password is not expired, redirect to dashboard
  if (!hasExpired) {
    redirect("/");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <svg className="h-8 w-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Password Change Required
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your password has expired or is temporary. Please set a new password to continue.
          </p>
        </div>

        {/* User Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
              <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                {profile?.full_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profile?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <ChangePasswordForm />

        {/* Info */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
          <div className="flex gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Password Requirements:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <li>• At least 8 characters long</li>
                <li>• Mix of uppercase and lowercase letters</li>
                <li>• Include numbers and special characters</li>
                <li>• Different from your current password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
