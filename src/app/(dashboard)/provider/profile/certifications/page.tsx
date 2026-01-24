'use client';

import { CertificationsManager } from '@/components/provider/certifications/CertificationsManager';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function ProviderCertificationsPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
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

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <h2 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Minhas Certificações
        </h2>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Adicione suas certificações para aumentar a confiança dos clientes
        </p>
      </div>

      <CertificationsManager providerId={user.id} />
    </div>
  );
}
