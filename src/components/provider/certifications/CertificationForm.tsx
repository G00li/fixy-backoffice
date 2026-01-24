'use client';

import { useState } from 'react';
import { useCreateCertification, useUpdateCertification } from '@/hooks/useProviderCertifications';
import type { ProviderCertification } from '@/types/provider-specialties';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';

interface CertificationFormProps {
  providerId: string;
  editingCertification?: ProviderCertification;
  onClose: () => void;
}

export function CertificationForm({
  providerId,
  editingCertification,
  onClose,
}: CertificationFormProps) {
  const [name, setName] = useState(editingCertification?.name || '');
  const [issuer, setIssuer] = useState(editingCertification?.issuer || '');
  const [issueDate, setIssueDate] = useState(editingCertification?.issue_date || '');
  const [expiryDate, setExpiryDate] = useState(editingCertification?.expiry_date || '');
  const [credentialId, setCredentialId] = useState(editingCertification?.credential_id || '');
  const [credentialUrl, setCredentialUrl] = useState(editingCertification?.credential_url || '');
  const [documentUrl, setDocumentUrl] = useState(editingCertification?.document_url || '');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateCertification(providerId);
  const updateMutation = useUpdateCertification(providerId);

  const validateDates = (): string | null => {
    if (issueDate && expiryDate) {
      const issue = new Date(issueDate);
      const expiry = new Date(expiryDate);
      if (expiry <= issue) {
        return 'A data de validade deve ser posterior à data de emissão';
      }
    }
    if (issueDate) {
      const issue = new Date(issueDate);
      const today = new Date();
      if (issue > today) {
        return 'A data de emissão não pode ser futura';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }

    try {
      if (editingCertification) {
        await updateMutation.mutateAsync({
          id: editingCertification.id,
          data: {
            name,
            issuer,
            issue_date: issueDate || undefined,
            expiry_date: expiryDate || undefined,
            credential_id: credentialId || undefined,
            credential_url: credentialUrl || undefined,
            document_url: documentUrl || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name,
          issuer,
          issue_date: issueDate || undefined,
          expiry_date: expiryDate || undefined,
          credential_id: credentialId || undefined,
          credential_url: credentialUrl || undefined,
          document_url: documentUrl || undefined,
        });
      }
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao salvar certificação');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {editingCertification ? 'Editar Certificação' : 'Nova Certificação'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {editingCertification 
              ? 'Atualize as informações da certificação' 
              : 'Adicione uma nova certificação ao seu perfil profissional'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Nome da Certificação *</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              placeholder="Ex: Certificação em Barbeiro Profissional"
            />
          </div>

          <div>
            <Label>Entidade Emissora *</Label>
            <Input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              required
              maxLength={200}
              placeholder="Ex: IEFP, CENFIM, Academia de Formação, etc."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Data de Emissão</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label>Data de Validade</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={issueDate || undefined}
              />
              <p className="mt-1.5 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Deixe em branco se não expira
              </p>
            </div>
          </div>

          <div>
            <Label>ID da Credencial</Label>
            <Input
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              maxLength={100}
              placeholder="Ex: CERT-2024-12345"
            />
          </div>

          <div>
            <Label>URL da Credencial</Label>
            <Input
              type="url"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://exemplo.pt/verificar/credencial"
            />
            <p className="mt-1.5 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Link para verificação online da certificação
            </p>
          </div>

          <div>
            <Label>URL do Documento</Label>
            <Input
              type="url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://exemplo.pt/certificado.pdf"
            />
            <p className="mt-1.5 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Link para o certificado em PDF ou imagem
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  A guardar...
                </>
              ) : (
                editingCertification ? 'Guardar Alterações' : 'Adicionar Certificação'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
