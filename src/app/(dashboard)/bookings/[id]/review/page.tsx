'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ReviewForm from '@/components/reviews/ReviewForm';
import { getReviewByBookingId } from '@/app/actions/reviews';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingReviewPage({ params }: PageProps) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>('');
  const [booking, setBooking] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        setBookingId(resolvedParams.id);
        
        const supabase = createClient();

        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/signin');
          return;
        }

        // Get booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            provider:profiles!provider_id(full_name, business_name),
            service:services(title)
          `)
          .eq('id', resolvedParams.id)
          .single();

        if (bookingError || !bookingData) {
          setError('Agendamento não encontrado');
          setLoading(false);
          return;
        }

        // Verify user is the client
        if (bookingData.client_id !== user.id) {
          router.push('/bookings');
          return;
        }

        setBooking(bookingData);

        // Check if review already exists
        const reviewResult = await getReviewByBookingId(resolvedParams.id);
        if (reviewResult.success && reviewResult.review) {
          setExistingReview(reviewResult.review);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading booking:', err);
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

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-200">{error || 'Agendamento não encontrado'}</p>
          <Link
            href="/bookings"
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar aos Agendamentos
          </Link>
        </div>
      </div>
    );
  }

  // Verify booking is completed
  if (booking.status !== 'completed') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-yellow-600 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-yellow-900 dark:text-yellow-100">
            Agendamento não concluído
          </h2>
          <p className="mt-2 text-yellow-800 dark:text-yellow-200">
            Você só pode avaliar agendamentos que foram concluídos.
          </p>
          <Link
            href="/bookings"
            className="mt-6 inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Voltar aos Agendamentos
          </Link>
        </div>
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-blue-900 dark:text-blue-100">
            Você já avaliou este serviço
          </h2>
          <p className="mt-2 text-blue-800 dark:text-blue-200">
            Obrigado pelo seu feedback!
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link
              href="/bookings"
              className="px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Voltar aos Agendamentos
            </Link>
            <Link
              href={`/providers/${booking.provider_id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Perfil do Provider
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const providerName = booking.provider.business_name || booking.provider.full_name;
  const serviceName = booking.service?.title || 'Serviço';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar aos agendamentos
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Avaliar Serviço
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sua opinião ajuda outros clientes a tomar melhores decisões
        </p>
      </div>

      {/* Review Form */}
      <ReviewForm
        bookingId={bookingId}
        serviceName={serviceName}
        providerName={providerName}
        onSuccess={() => {
          router.push('/bookings');
        }}
        onCancel={() => {
          router.push('/bookings');
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
            <p className="font-medium mb-1">Dicas para uma boa avaliação:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li>Seja honesto e específico sobre sua experiência</li>
              <li>Mencione pontos positivos e áreas de melhoria</li>
              <li>Adicione fotos se possível (ajuda outros clientes)</li>
              <li>Você pode editar sua avaliação em até 7 dias</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
