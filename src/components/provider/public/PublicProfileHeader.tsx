'use client';

interface PublicProfileHeaderProps {
  profile: {
    full_name: string;
    business_name?: string;
    display_name?: string;
    avatar_url?: string;
    is_verified: boolean;
    location_text?: string;
  };
  primaryCategory?: {
    category_name: string;
  };
  statistics: {
    avg_rating: number;
    total_reviews: number;
    total_bookings: number;
  };
}

export function PublicProfileHeader({
  profile,
  primaryCategory,
  statistics,
}: PublicProfileHeaderProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Avatar */}
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">
              👤
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {profile.display_name || profile.full_name}
            </h1>
            {profile.is_verified && (
              <span className="text-2xl text-blue-600" title="Verificado">
                ✓
              </span>
            )}
          </div>

          {profile.business_name && (
            <p className="mb-2 text-gray-600">{profile.business_name}</p>
          )}

          {primaryCategory && (
            <p className="mb-3 font-medium text-primary">
              {primaryCategory.category_name}
            </p>
          )}

          {profile.location_text && (
            <p className="mb-4 flex items-center gap-1 text-sm text-gray-600">
              📍 {profile.location_text}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-2xl font-bold">
                {statistics.avg_rating.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">
                ⭐ {statistics.total_reviews} avaliações
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{statistics.total_bookings}</p>
              <p className="text-sm text-gray-600">📅 Agendamentos</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <button className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 md:w-auto">
            Agendar Serviço
          </button>
        </div>
      </div>
    </div>
  );
}
