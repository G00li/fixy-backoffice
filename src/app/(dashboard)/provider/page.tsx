'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProviderStats } from '@/hooks/useProviderStats';
import { useProviderChartData } from '@/hooks/useProviderChartData';
import { useProviderPortfolio } from '@/hooks/useProviderPortfolio';
import { useProviderCertifications } from '@/hooks/useProviderCertifications';
import { ProviderStatsCards } from '@/components/provider/dashboard/ProviderStatsCards';
import { BookingsChart } from '@/components/provider/dashboard/BookingsChart';
import { ReviewsChart } from '@/components/provider/dashboard/ReviewsChart';

export default function ProviderDashboardPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { data: stats, isLoading: statsLoading } = useProviderStats(user?.id || '');
  const { data: chartData, isLoading: chartLoading } = useProviderChartData(user?.id || '');
  const { data: portfolio, isLoading: portfolioLoading } = useProviderPortfolio(user?.id || '');
  const { data: certifications, isLoading: certificationsLoading } = useProviderCertifications(user?.id || '');

  const isLoading = userLoading || statsLoading || chartLoading || portfolioLoading || certificationsLoading;

  if (userLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            <p className="text-sm text-gray-500 dark:text-gray-400">A carregar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            Erro: Utilizador não autenticado
          </p>
        </div>
      </div>
    );
  }

  const providerStats = stats || {
    avg_rating: 0,
    total_reviews: 0,
    total_bookings: 0,
    completed_bookings: 0,
    followers_count: 0,
    total_posts: 0,
    total_views: 0,
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Dashboard
        </h2>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Visão geral do seu desempenho profissional
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <ProviderStatsCards
            stats={providerStats}
            portfolioCount={portfolio?.length || 0}
            certificationsCount={certifications?.length || 0}
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bookings Chart */}
        <div>
          {chartLoading ? (
            <div className="h-[400px] animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800" />
          ) : chartData?.bookings ? (
            <BookingsChart data={chartData.bookings} />
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sem dados de agendamentos
              </p>
            </div>
          )}
        </div>

        {/* Reviews Chart */}
        <div>
          {chartLoading ? (
            <div className="h-[400px] animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800" />
          ) : chartData?.reviews ? (
            <ReviewsChart data={chartData.reviews} />
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sem dados de avaliações
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
