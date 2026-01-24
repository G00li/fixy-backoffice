'use client';

import { Metadata } from 'next';
import ProviderStatusToggle from '@/components/provider-status/ProviderStatusToggle';
import ProviderScheduleManager from '@/components/provider-status/ProviderScheduleManager';
import ProviderStatusWidget from '@/components/provider-status/ProviderStatusWidget';
import AuthGuard from '@/components/auth/AuthGuard';
import { useUser } from '@/context/UserContext';

function ProviderStatusContent() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          My Status & Schedule
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your availability status and weekly schedule
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Status */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Status
            </h2>
            <ProviderStatusWidget 
              providerId={user.id}
              showMessage={true}
              showLastUpdate={true}
            />
          </div>

          {/* Status Control */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status Control
            </h2>
            <ProviderStatusToggle providerId={user.id} />
          </div>
        </div>

        {/* Schedule Manager */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Schedule
          </h2>
          <ProviderScheduleManager 
            providerId={user.id}
            isOwner={true}
          />
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 How it works
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Manual Mode:</strong> Control your status manually with the toggle or detailed controls</li>
          <li>• <strong>Automatic Mode:</strong> Set your weekly schedule and enable auto-status to automatically open/close</li>
          <li>• <strong>Auto-Close:</strong> Schedule automatic closure after a specific time</li>
          <li>• <strong>Override:</strong> Manual changes always take priority over automatic schedule</li>
        </ul>
      </div>
    </div>
  );
}

export default function ProviderStatusPage() {
  return (
    <AuthGuard requiredRole="provider">
      <ProviderStatusContent />
    </AuthGuard>
  );
}
