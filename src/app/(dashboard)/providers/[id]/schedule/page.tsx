import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/users';
import { getProviderBookings } from '@/app/actions/bookings';
import ProviderNavigation from '@/components/providers/ProviderNavigation';
import BookingsList from '@/components/bookings/BookingsList';

export const metadata: Metadata = {
  title: 'Agenda | Fixy Backoffice',
  description: 'Manage your schedule and bookings',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProviderSchedulePage({ params }: PageProps) {
  // Get current user
  const { user } = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const providerId = params.id;
  const isOwner = user.id === providerId;

  // Only owner can access schedule
  if (!isOwner) {
    redirect(`/providers/${providerId}/posts`);
  }

  // Fetch bookings
  const result = await getProviderBookings();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <ProviderNavigation providerId={providerId} />
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            {result.error || 'Erro ao carregar agendamentos'}
          </p>
        </div>
      </div>
    );
  }

  const { bookings } = result;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <ProviderNavigation providerId={providerId} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Minha Agenda
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerencie seus agendamentos e disponibilidade
          </p>
        </div>
      </div>

      {/* Bookings List */}
      <BookingsList
        bookings={bookings}
        isProvider={true}
      />
    </div>
  );
}
