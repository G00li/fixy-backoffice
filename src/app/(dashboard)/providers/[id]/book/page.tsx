'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BookingForm from '@/components/bookings/BookingForm';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProviderBookPage({ params }: PageProps) {
  const router = useRouter();
  const [providerId, setProviderId] = useState<string>('');
  const [provider, setProvider] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        setProviderId(resolvedParams.id);
        
        const supabase = createClient();

        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/signin');
          return;
        }

        // Get provider info
        const { data: providerData, error: providerError } = await supabase
          .from('profiles')
          .select('id, full_name, business_name, avatar_url, bio')
          .eq('id', resolvedParams.id)
          .eq('role', 'provider')
          .single();

        if (providerError || !providerData) {
          setError('Provider não encontrado');
          setLoading(false);
          return;
        }

        setProvider(providerData);

        // Get provider services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, title, description, duration_min, price')
          .eq('provider_id', resolvedParams.id)
          .eq('is_active', true)
          .order('title');

        if (servicesError) {
          setError('Erro ao carregar serviços');
          setLoading(false);
          return;
        }

        setServices(servicesData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading provider:', err);
        setError('Erro ao carregar dados');
        setLoading(false);
      }
    }

    loadData();
  }, [params, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-200">{error || 'Provider não encontrado'}</p>
          <Link
            href="/search"
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar à Busca
          </Link>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
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
            href={`/providers/${providerId}`}
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
        providerId={providerId}
        services={services}
        onSuccess={(bookingId) => {
          router.push('/bookings');
        }}
        onCancel={() => {
          router.push(`/providers/${providerId}`);
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
