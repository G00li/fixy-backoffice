'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'brand' | 'purple' | 'green' | 'blue' | 'yellow' | 'red' | 'indigo' | 'pink';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ label, value, icon, color, trend }: StatCardProps) {
  const colorClasses = {
    brand: 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    pink: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend.isPositive
                ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
            }`}
          >
            <svg
              className={`h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-800 dark:text-white/90">{value}</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

interface ProviderStatsCardsProps {
  stats: {
    avg_rating: number;
    total_reviews: number;
    total_bookings: number;
    completed_bookings: number;
    followers_count: number;
    total_posts: number;
    total_views: number;
  };
  portfolioCount: number;
  certificationsCount: number;
}

export function ProviderStatsCards({
  stats,
  portfolioCount,
  certificationsCount,
}: ProviderStatsCardsProps) {
  const completionRate =
    stats.total_bookings > 0
      ? Math.round((stats.completed_bookings / stats.total_bookings) * 100)
      : 0;

  const profileCompleteness = calculateCompleteness(stats, portfolioCount, certificationsCount);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Avaliação Média"
        value={stats.avg_rating.toFixed(1)}
        color="yellow"
        icon={
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        }
      />
      <StatCard
        label="Total de Avaliações"
        value={stats.total_reviews}
        color="blue"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
      />
      <StatCard
        label="Agendamentos"
        value={stats.total_bookings}
        color="purple"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
      <StatCard
        label="Taxa de Conclusão"
        value={`${completionRate}%`}
        color="green"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <StatCard
        label="Itens no Portfolio"
        value={portfolioCount}
        color="indigo"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
      <StatCard
        label="Certificações"
        value={certificationsCount}
        color="brand"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        }
      />
      <StatCard
        label="Publicações"
        value={stats.total_posts}
        color="red"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
      />
      <StatCard
        label="Visualizações"
        value={stats.total_views}
        color="pink"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
      />
    </div>
  );
}

function calculateCompleteness(
  stats: any,
  portfolioCount: number,
  certificationsCount: number
): string {
  let score = 0;
  
  // Avaliações (20%)
  if (stats.total_reviews > 0) score += 20;
  
  // Agendamentos (20%)
  if (stats.total_bookings > 0) score += 20;
  
  // Portfolio (30%)
  if (portfolioCount >= 5) score += 30;
  else if (portfolioCount > 0) score += 15;
  
  // Certificações (30%)
  if (certificationsCount >= 2) score += 30;
  else if (certificationsCount > 0) score += 15;
  
  return `${score}%`;
}
