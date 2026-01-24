'use client';

import { useEffect, useState } from 'react';
import ProviderDashboardStats from '@/components/providers/ProviderDashboardStats';
import ProviderStatusWidget from '@/components/provider-status/ProviderStatusWidget';
import AuthGuard from '@/components/auth/AuthGuard';
import { useUser } from '@/context/UserContext';

function ProviderDashboardContent() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Provider Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your business and track your performance
        </p>
      </div>

      {/* Status Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProviderStatusWidget 
          providerId={user.id}
          showMessage={true}
          showLastUpdate={true}
        />
      </div>

      {/* Dashboard Stats */}
      <ProviderDashboardStats providerId={user.id} />
    </div>
  );
}

export default function ProviderDashboardPage() {
  return (
    <AuthGuard requiredRole="provider">
      <ProviderDashboardContent />
    </AuthGuard>
  );
}
