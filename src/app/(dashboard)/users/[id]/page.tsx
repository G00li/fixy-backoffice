import { Suspense, use } from 'react';
import Link from 'next/link';
import { getUserDetail, getUserAuditLog } from '@/app/actions/users';
import RoleBadge from '@/components/users/RoleBadge';
import { redirect } from 'next/navigation';

async function UserDetailContent({ userId }: { userId: string }) {
  const result = await getUserDetail(userId);

  if (!result.success) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">
          {result.error || 'Failed to load user'}
        </p>
      </div>
    );
  }

  const user = result.user;

  if (!user) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">
          User not found
        </p>
      </div>
    );
  }

  // Get audit log
  const auditResult = await getUserAuditLog(userId, 10);
  const logs = auditResult.success ? auditResult.logs : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/users"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Users
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Details
          </h1>
          <Link
            href={`/users/${userId}/edit`}
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit User
          </Link>
        </div>
      </div>

      {/* User Info Card */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={user.avatar_url}
                alt={user.full_name || 'User'}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                <span className="text-3xl font-medium text-brand-700 dark:text-brand-300">
                  {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.full_name || 'No name'}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {user.email}
            </p>
            <div className="mt-3">
              <RoleBadge role={user.role} size="lg" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 dark:border-gray-700 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Phone
            </h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {user.phone || 'Not provided'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Created At
            </h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {user.created_at
                ? new Date(user.created_at).toLocaleString()
                : 'Unknown'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Role Assigned
            </h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {user.role_assigned_at
                ? new Date(user.role_assigned_at).toLocaleString()
                : 'Unknown'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              User ID
            </h3>
            <p className="mt-1 font-mono text-xs text-gray-900 dark:text-white">
              {user.id}
            </p>
          </div>
        </div>

        {user.bio && (
          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Bio
            </h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {user.bio}
            </p>
          </div>
        )}
      </div>

      {/* Audit Log */}
      {logs && logs.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <div className="mt-4 space-y-4">
            {logs.map((log: any) => (
              <div
                key={log.id}
                className="flex items-start gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0 dark:border-gray-700"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                    <svg
                      className="h-4 w-4 text-brand-600 dark:text-brand-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {log.action_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = use(params);
  
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-r-transparent"></div>
        </div>
      }
    >
      <UserDetailContent userId={userId} />
    </Suspense>
  );
}
