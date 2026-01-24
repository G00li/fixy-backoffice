'use client';

import { use } from 'react';
import { PublicProviderProfile } from '@/components/provider/public/PublicProviderProfile';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProviderPublicProfilePage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <PublicProviderProfile providerId={id} />
    </div>
  );
}
