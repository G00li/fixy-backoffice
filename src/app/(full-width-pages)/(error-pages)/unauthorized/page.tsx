import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Denied | Fixy Backoffice',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Error Code */}
        <div>
          <h1 className="text-9xl font-bold text-gray-900 dark:text-white">
            403
          </h1>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Access Denied
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This area is restricted to administrators only. If you believe you should have access, please contact your system administrator.
          </p>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <svg
            className="h-32 w-32 text-gray-300 dark:text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signin"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            Back to Login
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Help Text */}
        <div className="pt-6">
          <p className="text-xs text-gray-500 dark:text-gray-600">
            Error Code: 403 - Forbidden
          </p>
        </div>
      </div>
    </div>
  );
}
