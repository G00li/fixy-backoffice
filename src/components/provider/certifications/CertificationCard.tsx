'use client';

import type { ProviderCertification } from '@/types/provider-specialties';
import { useDeleteCertification } from '@/hooks/useProviderCertifications';

interface CertificationCardProps {
  certification: ProviderCertification;
  onEdit: () => void;
}

export function CertificationCard({ certification, onEdit }: CertificationCardProps) {
  const deleteMutation = useDeleteCertification(certification.provider_id);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover esta certificação?')) return;
    try {
      await deleteMutation.mutateAsync(certification.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao remover certificação');
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = certification.expiry_date && new Date(certification.expiry_date) < new Date();

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Badge de verificação ou expiração */}
      {certification.is_verified && !isExpired && (
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verificado
          </span>
        </div>
      )}
      {isExpired && (
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Expirado
          </span>
        </div>
      )}

      <div className="mb-4 pr-20">
        <h4 className="mb-1.5 text-base font-semibold text-gray-800 dark:text-white/90">
          {certification.name}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {certification.issuer}
        </p>
      </div>

      {/* Informações de data */}
      <div className="mb-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
        {certification.issue_date && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Emitido: {formatDate(certification.issue_date)}</span>
          </div>
        )}
        {certification.expiry_date && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Validade: {formatDate(certification.expiry_date)}</span>
          </div>
        )}
        {certification.credential_id && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="font-mono">ID: {certification.credential_id}</span>
          </div>
        )}
      </div>

      {/* Links */}
      {(certification.credential_url || certification.document_url) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {certification.credential_url && (
            <a
              href={certification.credential_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Ver Credencial
            </a>
          )}
          {certification.document_url && (
            <a
              href={certification.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Ver Documento
            </a>
          )}
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-theme-xs transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          {deleteMutation.isPending ? 'A remover...' : 'Remover'}
        </button>
      </div>
    </div>
  );
}
