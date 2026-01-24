import { useQuery } from '@tanstack/react-query';
import type { CompleteProviderProfile } from '@/types/provider-specialties';

async function fetchPublicProfile(providerId: string): Promise<CompleteProviderProfile> {
  const response = await fetch(`/api/provider/profile/complete?providerId=${providerId}`);

  if (!response.ok) {
    throw new Error('Erro ao carregar perfil');
  }

  const data = await response.json();
  return data.data;
}

export function usePublicProfile(providerId: string) {
  return useQuery({
    queryKey: ['public-profile', providerId],
    queryFn: () => fetchPublicProfile(providerId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!providerId,
  });
}
