import { Metadata } from 'next';
import ProviderDashboardStats from '@/components/providers/ProviderDashboardStats';
import ProviderStatusWidget from '@/components/provider-status/ProviderStatusWidget';
import { getCurrentUserWithRole } from '@/app/actions/permissions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Provider Dashboard | Fixy Backoffice',
  description: 'Manage your provider business',
};

export default async function ProviderDashboardPage() {
  const { user } = await getCurrentUserWithRole();
  
  if (!user) {
    redirect('/signin');
  }

  if (user.role !== 'provider') {
    redirect('/');
  }

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
    </div>
  );
}
