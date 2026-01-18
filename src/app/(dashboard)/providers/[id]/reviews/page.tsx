import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getProviderReviews, getReviewStats } from '@/app/actions/reviews';
import ReviewsList from '@/components/reviews/ReviewsList';
import ReviewStats from '@/components/reviews/ReviewStats';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProviderReviewsPage({ params }: PageProps) {
  const supabase = await createClient();

  // Await params (Next.js 15+)
  const { id: providerId } = await params;

  // Get provider info
  const { data: provider, error: providerError } = await supabase
    .from('profiles')
    .select('id, full_name, business_name, avatar_url, role')
    .eq('id', providerId)
    .eq('role', 'provider')
    .single();

  if (providerError || !provider) {
    notFound();
  }

  // Get reviews
  const reviewsResult = await getProviderReviews({
    provider_id: providerId,
    limit: 50,
  });

  // Get stats
  const statsResult = await getReviewStats(providerId);

  const reviews = reviewsResult.success ? reviewsResult.reviews || [] : [];
  const stats = statsResult.success ? statsResult.stats : null;

  const providerName = provider.business_name || provider.full_name;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/providers/${providerId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao perfil
        </Link>

        <div className="flex items-center gap-4">
          {provider.avatar_url && (
            <img
              src={provider.avatar_url}
              alt={providerName}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Avaliações de {providerName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Veja o que os clientes estão dizendo
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Sidebar */}
        <div className="lg:col-span-1">
          {stats ? (
            <div className="sticky top-4">
              <ReviewStats stats={stats} />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma estatística disponível
              </p>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          {reviews.length > 0 ? (
            <ReviewsList
              reviews={reviews}
              isProvider={false}
              onFlag={async (reviewId, reason) => {
                'use server';
                // This will be handled client-side
              }}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Nenhuma avaliação ainda
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Este provider ainda não recebeu avaliações
              </p>
              <Link
                href={`/providers/${providerId}/book`}
                className="mt-6 inline-block px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                Seja o primeiro a avaliar
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
