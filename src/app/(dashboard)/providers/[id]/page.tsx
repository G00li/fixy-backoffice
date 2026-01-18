import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/users';
import { getProviderStatus, getProviderSettings } from '@/app/actions/provider-status';
import { createClient } from '@/lib/supabase/server';
import ProviderNavigation from '@/components/providers/ProviderNavigation';
import ProviderDashboardStats from '@/components/providers/ProviderDashboardStats';
import ProviderStatusWidget from '@/components/provider-status/ProviderStatusWidget';
import ProviderStatusToggle from '@/components/provider-status/ProviderStatusToggle';
import ProviderScheduleManager from '@/components/provider-status/ProviderScheduleManager';

export const metadata: Metadata = {
  title: 'Provider Dashboard | Fixy Backoffice',
  description: 'Manage your provider profile and settings',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProviderDashboardPage({ params }: PageProps) {
  // Get current user
  const { user } = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Await params (Next.js 15+)
  const { id: providerId } = await params;
  const isOwner = user.id === providerId;

  // Check if user is admin or above
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc('is_admin_or_above');

  // Only owner or admin can access dashboard
  if (!isOwner && !isAdmin) {
    redirect(`/providers/${providerId}/posts`);
  }

  // Fetch provider data
  const statusResult = await getProviderStatus(providerId);
  const settingsResult = await getProviderSettings(providerId);

  // Mock stats for now (TODO: implement real stats)
  const stats = {
    totalPosts: 0,
    totalViews: 0,
    averageRating: 0,
    totalBookings: 0,
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <ProviderNavigation providerId={providerId} />

      {/* Admin viewing indicator */}
      {!isOwner && isAdmin && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Você está visualizando este perfil como administrador
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your availability, schedule, and view your performance
        </p>
      </div>

      {/* Stats */}
      <ProviderDashboardStats stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Status Widget */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Status
            </h2>
            <ProviderStatusWidget
              providerId={providerId}
              showMessage={true}
              showLastUpdate={true}
            />
          </div>

          {/* Status Control */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status Control
            </h2>
            <ProviderStatusToggle providerId={providerId} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Schedule Manager */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Schedule
            </h2>
            <ProviderScheduleManager
              providerId={providerId}
              isOwner={true}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href={`/providers/${providerId}/posts/new`}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Create Post
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Share your work
              </p>
            </div>
          </a>

          <a
            href={`/providers/${providerId}/services`}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Manage Services
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add or edit services
              </p>
            </div>
          </a>

          <a
            href={`/providers/${providerId}/schedule`}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                View Schedule
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Check bookings
              </p>
            </div>
          </a>

          <a
            href={`/providers/${providerId}/posts`}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                View Posts
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage portfolio
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Automation Info */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Automatic Status Management
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Configure your weekly schedule to automatically update your status based on your working hours.
                Enable automation in the Schedule Manager above.
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
                Pro Tip
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Keep your status updated to appear in "Open Now" searches. Clients are 3x more likely to contact
                providers who are currently available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
