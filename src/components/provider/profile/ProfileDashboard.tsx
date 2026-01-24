'use client';

import Link from 'next/link';
import { useProviderSpecialties } from '@/hooks/useProviderSpecialties';
import { useProviderPortfolio } from '@/hooks/useProviderPortfolio';
import { useProviderCertifications } from '@/hooks/useProviderCertifications';
import { ProfilePreview } from './ProfilePreview';

interface ProfileDashboardProps {
  providerId: string;
}

export function ProfileDashboard({ providerId }: ProfileDashboardProps) {
  const { data: specialties, isLoading: loadingSpecialties } = useProviderSpecialties(providerId);
  const { data: portfolio, isLoading: loadingPortfolio } = useProviderPortfolio(providerId);
  const { data: certifications, isLoading: loadingCertifications } = useProviderCertifications(providerId);

  const isLoading = loadingSpecialties || loadingPortfolio || loadingCertifications;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">A carregar perfil...</p>
        </div>
      </div>
    );
  }

  const hasPrimaryCategory = specialties?.some((s) => s.category_type === 'primary');

  const mockProfile = {
    profile: {
      id: providerId,
      full_name: 'Provider Name',
      display_name: 'Provider Display',
      avatar_url: '',
      bio: 'Professional service provider',
      is_verified: true,
    },
    primary_category: specialties?.find((s) => s.category_type === 'primary'),
    secondary_categories: specialties?.filter((s) => s.category_type === 'secondary') || [],
    certifications: certifications || [],
    portfolio: portfolio || [],
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/provider/profile/specialties"
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
            <svg className="h-16 w-16 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="relative">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
              <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-gray-800 dark:text-white/90">Especialidades</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {specialties?.length || 0} configuradas
            </p>
          </div>
        </Link>

        <Link
          href="/provider/profile/portfolio"
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
            <svg className="h-16 w-16 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="relative">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-gray-800 dark:text-white/90">Portfolio</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {portfolio?.length || 0} itens
            </p>
          </div>
        </Link>

        <Link
          href="/provider/profile/certifications"
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
            <svg className="h-16 w-16 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="relative">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-500/10">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-gray-800 dark:text-white/90">Certificações</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {certifications?.length || 0} certificações
            </p>
          </div>
        </Link>

        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="absolute right-4 top-4 opacity-10">
            <svg className="h-16 w-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div className="relative">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-gray-800 dark:text-white/90">Visibilidade</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasPrimaryCategory ? (
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Inativo
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Alert if no primary category */}
      {!hasPrimaryCategory && (
        <div className="rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 dark:border-yellow-900/50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-base font-semibold text-yellow-900 dark:text-yellow-200">
                Configure sua Especialidade Principal
              </h4>
              <p className="mb-4 text-sm text-yellow-800 dark:text-yellow-300">
                Seu perfil não está visível para clientes. Configure pelo menos uma especialidade principal para começar a receber agendamentos.
              </p>
              <Link
                href="/provider/profile/specialties"
                className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              >
                Configurar Agora
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile Preview */}
      {hasPrimaryCategory && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
              <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Como os Clientes Veem Você</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pré-visualização do seu perfil público</p>
            </div>
          </div>
          <ProfilePreview profile={mockProfile as any} />
        </div>
      )}
    </div>
  );
}
