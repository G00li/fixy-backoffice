'use server';

import { createClient } from '@/lib/supabase/server';
import {
  SearchParams,
  SearchResponse,
  ProviderSearchResult,
  Category,
  SEARCH_VALIDATION,
} from '@/types/search';

// Search providers with filters and pagination
export async function searchProviders(params: SearchParams): Promise<SearchResponse> {
  try {
    const supabase = await createClient();

    // Validate and set defaults
    const searchText = params.searchText?.trim() || null;
    const categoryId = params.categoryId || null;
    const userLat = params.userLat || null;
    const userLng = params.userLng || null;
    const radiusKm = params.radiusKm || SEARCH_VALIDATION.DEFAULT_RADIUS_KM;
    const minRating = params.minRating || SEARCH_VALIDATION.MIN_RATING;
    const showClosed = params.showClosed !== undefined ? params.showClosed : true;
    const sortBy = params.sortBy || 'relevance';
    const page = params.page || 1;
    const limit = Math.min(params.limit || SEARCH_VALIDATION.DEFAULT_LIMIT, SEARCH_VALIDATION.MAX_LIMIT);
    const offset = (page - 1) * limit;

    // Validate search text length
    if (searchText && searchText.length < SEARCH_VALIDATION.MIN_SEARCH_LENGTH) {
      return {
        success: false,
        error: `Busca deve ter pelo menos ${SEARCH_VALIDATION.MIN_SEARCH_LENGTH} caracteres`,
      };
    }

    if (searchText && searchText.length > SEARCH_VALIDATION.MAX_SEARCH_LENGTH) {
      return {
        success: false,
        error: `Busca deve ter no máximo ${SEARCH_VALIDATION.MAX_SEARCH_LENGTH} caracteres`,
      };
    }

    // Validate radius
    if (radiusKm < SEARCH_VALIDATION.MIN_RADIUS_KM || radiusKm > SEARCH_VALIDATION.MAX_RADIUS_KM) {
      return {
        success: false,
        error: `Raio deve estar entre ${SEARCH_VALIDATION.MIN_RADIUS_KM} e ${SEARCH_VALIDATION.MAX_RADIUS_KM} km`,
      };
    }

    // Call the search_providers function
    const { data: results, error } = await supabase.rpc('search_providers', {
      p_search_text: searchText,
      p_category_id: categoryId,
      p_user_lat: userLat,
      p_user_lng: userLng,
      p_radius_km: radiusKm,
      p_min_rating: minRating,
      p_show_closed: showClosed,
      p_sort_by: sortBy,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error('Error searching providers:', error);
      return {
        success: false,
        error: 'Erro ao buscar prestadores',
      };
    }

    // Get total count for pagination (approximate)
    // Note: For better performance, we could add a separate count function
    const totalPages = results && results.length === limit ? page + 1 : page;

    return {
      success: true,
      results: results as ProviderSearchResult[],
      total: results?.length || 0,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('Unexpected error searching providers:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar prestadores',
    };
  }
}

// Get all active categories
export async function getCategories() {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: 'Erro ao buscar categorias' };
    }

    return {
      success: true,
      categories: categories as Category[],
    };
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar categorias',
    };
  }
}

// Get suggested providers based on user location
export async function getSuggestedProviders(params: {
  userLat?: number;
  userLng?: number;
  limit?: number;
}) {
  try {
    const supabase = await createClient();

    const limit = Math.min(params.limit || 6, 20);

    // Get top-rated providers near user
    const { data: results, error } = await supabase.rpc('search_providers', {
      p_search_text: null,
      p_category_id: null,
      p_user_lat: params.userLat || null,
      p_user_lng: params.userLng || null,
      p_radius_km: 20,
      p_min_rating: 4.0,
      p_show_closed: true,
      p_sort_by: 'rating',
      p_limit: limit,
      p_offset: 0,
    });

    if (error) {
      console.error('Error fetching suggested providers:', error);
      return {
        success: false,
        error: 'Erro ao buscar sugestões',
      };
    }

    return {
      success: true,
      providers: results as ProviderSearchResult[],
    };
  } catch (error) {
    console.error('Unexpected error fetching suggested providers:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar sugestões',
    };
  }
}

// Get provider details for search result
export async function getProviderDetails(providerId: string) {
  try {
    // Validate providerId
    if (!providerId || providerId === 'undefined') {
      console.error('Invalid providerId:', providerId);
      return {
        success: false,
        error: 'Invalid provider ID',
      };
    }

    const supabase = await createClient();

    const { data: provider, error } = await supabase
      .from('profiles')
      .select(`
        *,
        provider_status (
          is_open,
          status_type,
          status_message
        )
      `)
      .eq('id', providerId)
      .single();

    if (error) {
      console.error('Error fetching provider details:', error, 'Provider ID:', providerId);
      return {
        success: false,
        error: 'Prestador não encontrado',
      };
    }

    return {
      success: true,
      provider,
    };
  } catch (error) {
    console.error('Unexpected error fetching provider details:', error, 'Provider ID:', providerId);
    return {
      success: false,
      error: 'Erro inesperado ao buscar detalhes',
    };
  }
}
