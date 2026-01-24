import { useQuery } from '@tanstack/react-query';
import type { SearchProvidersRequest, ProviderSearchResult } from '@/types/provider-specialties';

interface SearchResponse {
  success: boolean;
  data: ProviderSearchResult[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

async function searchProviders(params: SearchProvidersRequest): Promise<SearchResponse> {
  const response = await fetch('/api/search/providers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar providers');
  }

  return response.json();
}

export function useProviderSearch(params: SearchProvidersRequest) {
  return useQuery({
    queryKey: ['provider-search', params],
    queryFn: () => searchProviders(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!(params.category_ids?.length || params.search_text || params.specialty_tags?.length),
  });
}
