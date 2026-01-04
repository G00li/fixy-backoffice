import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import BookingForm from '@/components/bookings/BookingForm';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProviderBookPage({ params }: PageProps) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get provider info
  const { data: provider, error: providerError } = await supabase
    .from('profiles')
    .select('id, full_name, business_name, avatar_url, bio')
    .eq('id', params.id)
    .eq('role', 'provider')
    .single();

  if (providerError || !provider) {
    notFound();
  }

  // Get provider services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, title, description, duration_min, price')
    .eq('provider_id', params.id)
    .eq('is_active', true)
    .order('title');

  if (servicesError || !services || services.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Nenhum serviço disponível
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Este provider não possui serviços ativos no momento.
          </p>
          <Link
            href={`/providers/${params.id}`}
            className="mt-6 inline-block px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Voltar ao Perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/providers/${params.id}`}
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
              alt={provider.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agendar com {provider.business_name || provider.full_name}
            </h1>
            {provider.bio && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{provider.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <BookingForm
        providerId={params.id}
        services={services}
        onSuccess={(bookingId) => {
          // Redirect to bookings page on success
          window.location.href = '/bookings';
        }}
        onCancel={() => {
          window.location.href = `/providers/${params.id}`;
        }}
      />

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
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
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Como funciona o agendamento?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li>Selecione o serviço desejado</li>
              <li>Escolha a data e horário disponível</li>
              <li>Adicione informações adicionais (opcional)</li>
              <li>Confirme o agendamento</li>
              <li>Aguarde a aprovação do provider</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
