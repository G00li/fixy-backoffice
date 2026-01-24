'use client';

import type { CompleteProviderProfile } from '@/types/provider-specialties';

interface ProfilePreviewProps {
  profile: CompleteProviderProfile;
}

export function ProfilePreview({ profile }: ProfilePreviewProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Preview do Perfil Público</h3>
        <button className="text-sm text-primary hover:underline">
          Ver Perfil Completo →
        </button>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
          {profile.profile.avatar_url ? (
            <img
              src={profile.profile.avatar_url}
              alt={profile.profile.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              👤
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="text-xl font-bold">
              {profile.profile.display_name || profile.profile.full_name}
            </h4>
            {profile.profile.is_verified && (
              <span className="text-blue-600" title="Verificado">
                ✓
              </span>
            )}
          </div>
          {profile.profile.business_name && (
            <p className="text-sm text-gray-600">{profile.profile.business_name}</p>
          )}
          {profile.primary_category && (
            <p className="mt-1 text-sm font-medium text-primary">
              {profile.primary_category.category_name}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.profile.bio && (
        <div className="mb-4">
          <p className="text-sm text-gray-700">{profile.profile.bio}</p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 flex gap-4 border-y border-gray-200 py-3">
        <div className="text-center">
          <p className="text-lg font-bold">{profile.statistics.avg_rating.toFixed(1)}</p>
          <p className="text-xs text-gray-600">Avaliação</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{profile.statistics.total_reviews}</p>
          <p className="text-xs text-gray-600">Avaliações</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{profile.portfolio.length}</p>
          <p className="text-xs text-gray-600">Portfolio</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{profile.certifications.length}</p>
          <p className="text-xs text-gray-600">Certificações</p>
        </div>
      </div>

      {/* Primary Category */}
      {profile.primary_category && (
        <div className="mb-4">
          <h5 className="mb-2 text-sm font-semibold">Especialidade Principal</h5>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="mb-1 font-medium">{profile.primary_category.category_name}</p>
            {profile.primary_category.years_experience && (
              <p className="text-xs text-gray-600">
                {profile.primary_category.years_experience} anos de experiência
              </p>
            )}
            {profile.primary_category.specialty_tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {profile.primary_category.specialty_tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Preview */}
      {profile.portfolio.length > 0 && (
        <div>
          <h5 className="mb-2 text-sm font-semibold">Portfolio</h5>
          <div className="grid grid-cols-4 gap-2">
            {profile.portfolio.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="aspect-square overflow-hidden rounded-lg bg-gray-200"
              >
                <img
                  src={item.thumbnail_url || item.media_url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
