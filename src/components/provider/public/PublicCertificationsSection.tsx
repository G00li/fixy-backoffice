'use client';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  credential_url?: string;
  is_verified: boolean;
}

interface PublicCertificationsSectionProps {
  certifications: Certification[];
}

export function PublicCertificationsSection({
  certifications,
}: PublicCertificationsSectionProps) {
  if (certifications.length === 0) {
    return null;
  }

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        Certificações ({certifications.length})
      </h2>

      <div className="space-y-4">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold">{cert.name}</h3>
                  {cert.is_verified && (
                    <span className="text-green-600" title="Verificado">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{cert.issuer}</p>
              </div>
            </div>

            {(cert.issue_date || cert.expiry_date) && (
              <div className="mb-2 text-xs text-gray-500">
                {cert.issue_date && (
                  <span>Emitido: {formatDate(cert.issue_date)}</span>
                )}
                {cert.issue_date && cert.expiry_date && <span> • </span>}
                {cert.expiry_date && (
                  <span>Validade: {formatDate(cert.expiry_date)}</span>
                )}
              </div>
            )}

            {cert.credential_url && (
              <a
                href={cert.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Ver Credencial →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
