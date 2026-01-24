'use client';

interface Specialty {
  category_name: string;
  category_slug: string;
  years_experience?: number;
  experience_level?: string;
  custom_description?: string;
  specialty_tags: string[];
}

interface PublicSpecialtiesSectionProps {
  primaryCategory?: Specialty & {
    avg_rating: number;
    total_services: number;
    total_bookings: number;
  };
  secondaryCategories: Specialty[];
}

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

export function PublicSpecialtiesSection({
  primaryCategory,
  secondaryCategories,
}: PublicSpecialtiesSectionProps) {
  if (!primaryCategory && secondaryCategories.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Especialidades</h2>

      {/* Primary Category */}
      {primaryCategory && (
        <div className="mb-6 rounded-lg bg-primary/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">
              {primaryCategory.category_name}
            </h3>
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
              Principal
            </span>
          </div>

          {(primaryCategory.years_experience || primaryCategory.experience_level) && (
            <div className="mb-3 flex gap-4 text-sm text-gray-700">
              {primaryCategory.years_experience && (
                <span>🏆 {primaryCategory.years_experience} anos</span>
              )}
              {primaryCategory.experience_level && (
                <span>
                  📊 {EXPERIENCE_LABELS[primaryCategory.experience_level]}
                </span>
              )}
            </div>
          )}

          {primaryCategory.custom_description && (
            <p className="mb-3 text-sm text-gray-700">
              {primaryCategory.custom_description}
            </p>
          )}

          {primaryCategory.specialty_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {primaryCategory.specialty_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-3 py-1 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Secondary Categories */}
      {secondaryCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Outras Especialidades
          </h3>
          {secondaryCategories.map((category) => (
            <div
              key={category.category_slug}
              className="rounded-lg border border-gray-200 p-4"
            >
              <h4 className="mb-2 font-medium">{category.category_name}</h4>

              {(category.years_experience || category.experience_level) && (
                <div className="mb-2 flex gap-4 text-xs text-gray-600">
                  {category.years_experience && (
                    <span>🏆 {category.years_experience} anos</span>
                  )}
                  {category.experience_level && (
                    <span>
                      📊 {EXPERIENCE_LABELS[category.experience_level]}
                    </span>
                  )}
                </div>
              )}

              {category.specialty_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {category.specialty_tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
