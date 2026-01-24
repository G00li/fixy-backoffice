'use client';

import { usePublicProfile } from '@/hooks/usePublicProfile';
import { PublicProfileHeader } from './PublicProfileHeader';
import { PublicAboutSection } from './PublicAboutSection';
import { PublicSpecialtiesSection } from './PublicSpecialtiesSection';
import { PublicPortfolioGallery } from './PublicPortfolioGallery';
import { PublicCertificationsSection } from './PublicCertificationsSection';
import { PublicReviewsSection } from './PublicReviewsSection';

interface PublicProviderProfileProps {
  providerId: string;
}

export function PublicProviderProfile({ providerId }: PublicProviderProfileProps) {
  const { data: profile, isLoading, error } = usePublicProfile(providerId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-2 text-4xl">⏳</div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-12 text-center">
        <p className="mb-2 text-4xl">⚠️</p>
        <p className="mb-1 font-semibold text-red-900">
          Erro ao carregar perfil
        </p>
        <p className="text-sm text-red-700">
          {error?.message || 'Perfil não encontrado'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PublicProfileHeader
        profile={profile.profile}
        primaryCategory={profile.primary_category}
        statistics={profile.statistics}
      />

      <PublicAboutSection
        bio={profile.profile.bio}
        email={profile.profile.email}
        phone={profile.profile.phone}
        socialMedia={profile.profile.social_media}
      />

      <PublicSpecialtiesSection
        primaryCategory={profile.primary_category}
        secondaryCategories={profile.secondary_categories}
      />

      <PublicPortfolioGallery items={profile.portfolio} />

      <PublicCertificationsSection certifications={profile.certifications} />

      <PublicReviewsSection
        avgRating={profile.statistics.avg_rating}
        totalReviews={profile.statistics.total_reviews}
      />
    </div>
  );
}
