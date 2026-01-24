'use client';

interface PublicAboutSectionProps {
  bio?: string;
  email?: string;
  phone?: string;
  socialMedia?: Record<string, string>;
}

export function PublicAboutSection({
  bio,
  email,
  phone,
  socialMedia,
}: PublicAboutSectionProps) {
  if (!bio && !email && !phone && !socialMedia) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Sobre</h2>

      {bio && <p className="mb-4 text-gray-700">{bio}</p>}

      {(email || phone) && (
        <div className="space-y-2 border-t border-gray-200 pt-4">
          {email && (
            <p className="flex items-center gap-2 text-sm">
              <span>📧</span>
              <a href={`mailto:${email}`} className="text-primary hover:underline">
                {email}
              </a>
            </p>
          )}
          {phone && (
            <p className="flex items-center gap-2 text-sm">
              <span>📱</span>
              <a href={`tel:${phone}`} className="text-primary hover:underline">
                {phone}
              </a>
            </p>
          )}
        </div>
      )}

      {socialMedia && Object.keys(socialMedia).length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <p className="mb-2 text-sm font-medium">Redes Sociais</p>
          <div className="flex gap-3">
            {Object.entries(socialMedia).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
