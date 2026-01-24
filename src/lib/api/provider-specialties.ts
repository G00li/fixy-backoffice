// ============================================
// Provider Specialties API Helpers
// ============================================

import { createClient } from '@/lib/supabase/server';
import type {
  ProviderCategory,
  ProviderPortfolioItem,
  ProviderCertification,
  CreateSpecialtyRequest,
  UpdateSpecialtyRequest,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  CreateCertificationRequest,
  UpdateCertificationRequest,
  SearchProvidersRequest,
  ProviderSearchResult,
  CompleteProviderProfile,
  PROVIDER_LIMITS,
} from '@/types/provider-specialties';

// ============================================
// Specialties (Provider Categories)
// ============================================

export async function getProviderSpecialties(providerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('provider_categories')
    .select(`
      *,
      category:categories(id, name, slug, icon_url)
    `)
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createProviderSpecialty(
  providerId: string,
  request: CreateSpecialtyRequest
) {
  const supabase = await createClient();

  // Validar se já existe categoria primária (se for primária)
  if (request.category_type === 'primary') {
    const { data: existing } = await supabase
      .from('provider_categories')
      .select('id')
      .eq('provider_id', providerId)
      .eq('category_type', 'primary')
      .single();

    if (existing) {
      throw new Error('Provider already has a primary category');
    }
  }

  // Validar limite de categorias secundárias
  if (request.category_type === 'secondary') {
    const { count } = await supabase
      .from('provider_categories')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('category_type', 'secondary');

    if (count && count >= 2) {
      throw new Error('Provider can have maximum 2 secondary categories');
    }
  }

  // Validar limite de tags
  if (request.specialty_tags && request.specialty_tags.length > 10) {
    throw new Error('Maximum 10 specialty tags per category');
  }

  const { data, error } = await supabase
    .from('provider_categories')
    .insert({
      provider_id: providerId,
      ...request,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProviderSpecialty(
  specialtyId: string,
  providerId: string,
  request: UpdateSpecialtyRequest
) {
  const supabase = await createClient();

  // Validar limite de tags
  if (request.specialty_tags && request.specialty_tags.length > 10) {
    throw new Error('Maximum 10 specialty tags per category');
  }

  const { data, error } = await supabase
    .from('provider_categories')
    .update(request)
    .eq('id', specialtyId)
    .eq('provider_id', providerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProviderSpecialty(
  specialtyId: string,
  providerId: string
) {
  const supabase = await createClient();

  // Verificar se não é categoria primária
  const { data: specialty } = await supabase
    .from('provider_categories')
    .select('category_type')
    .eq('id', specialtyId)
    .eq('provider_id', providerId)
    .single();

  if (!specialty) {
    throw new Error('Specialty not found');
  }

  if (specialty.category_type === 'primary') {
    throw new Error('Cannot delete primary category');
  }

  const { error } = await supabase
    .from('provider_categories')
    .delete()
    .eq('id', specialtyId)
    .eq('provider_id', providerId);

  if (error) throw error;
}

// ============================================
// Portfolio
// ============================================

export async function getProviderPortfolio(providerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('provider_portfolio_items')
    .select(`
      *,
      category:categories(id, name)
    `)
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createPortfolioItem(
  providerId: string,
  request: CreatePortfolioRequest
) {
  const supabase = await createClient();

  // Validar limite de items
  const { count } = await supabase
    .from('provider_portfolio_items')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', providerId)
    .eq('is_active', true);

  if (count && count >= 50) {
    throw new Error('Maximum 50 portfolio items per provider');
  }

  // Obter próximo display_order
  const { data: lastItem } = await supabase
    .from('provider_portfolio_items')
    .select('display_order')
    .eq('provider_id', providerId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const display_order = lastItem ? lastItem.display_order + 1 : 0;

  const { data, error } = await supabase
    .from('provider_portfolio_items')
    .insert({
      provider_id: providerId,
      display_order,
      ...request,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePortfolioItem(
  itemId: string,
  providerId: string,
  request: UpdatePortfolioRequest
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('provider_portfolio_items')
    .update(request)
    .eq('id', itemId)
    .eq('provider_id', providerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePortfolioItem(itemId: string, providerId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('provider_portfolio_items')
    .delete()
    .eq('id', itemId)
    .eq('provider_id', providerId);

  if (error) throw error;
}

export async function reorderPortfolioItems(
  providerId: string,
  items: Array<{ id: string; display_order: number }>
) {
  const supabase = await createClient();

  // Atualizar em batch
  const updates = items.map((item) =>
    supabase
      .from('provider_portfolio_items')
      .update({ display_order: item.display_order })
      .eq('id', item.id)
      .eq('provider_id', providerId)
  );

  const results = await Promise.all(updates);

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    throw new Error('Failed to reorder some items');
  }
}

// ============================================
// Certifications
// ============================================

export async function getProviderCertifications(providerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('provider_certifications')
    .select(`
      *,
      provider_category:provider_categories(
        category_id,
        category:categories(name)
      )
    `)
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCertification(
  providerId: string,
  request: CreateCertificationRequest
) {
  const supabase = await createClient();

  // Validar limite de certificações
  const { count } = await supabase
    .from('provider_certifications')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', providerId)
    .eq('is_active', true);

  if (count && count >= 20) {
    throw new Error('Maximum 20 certifications per provider');
  }

  // Validar datas
  if (request.issue_date && request.expiry_date) {
    if (new Date(request.issue_date) >= new Date(request.expiry_date)) {
      throw new Error('Issue date must be before expiry date');
    }
  }

  // Obter próximo display_order
  const { data: lastCert } = await supabase
    .from('provider_certifications')
    .select('display_order')
    .eq('provider_id', providerId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const display_order = lastCert ? lastCert.display_order + 1 : 0;

  const { data, error } = await supabase
    .from('provider_certifications')
    .insert({
      provider_id: providerId,
      display_order,
      ...request,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCertification(
  certificationId: string,
  providerId: string,
  request: UpdateCertificationRequest
) {
  const supabase = await createClient();

  // Validar datas se ambas forem fornecidas
  if (request.issue_date && request.expiry_date) {
    if (new Date(request.issue_date) >= new Date(request.expiry_date)) {
      throw new Error('Issue date must be before expiry date');
    }
  }

  const { data, error } = await supabase
    .from('provider_certifications')
    .update(request)
    .eq('id', certificationId)
    .eq('provider_id', providerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCertification(
  certificationId: string,
  providerId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('provider_certifications')
    .delete()
    .eq('id', certificationId)
    .eq('provider_id', providerId);

  if (error) throw error;
}

// ============================================
// Categories
// ============================================

export async function getCategories(level?: 1 | 2, parentId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (level) {
    query = query.eq('level', level);
  }

  if (parentId) {
    query = query.eq('parent_id', parentId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getCategoryById(categoryId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (error) throw error;
  return data;
}

export async function getCategoryTags(categoryId: string, limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_category_suggestions', {
    p_category_id: categoryId,
    p_limit: limit,
  });

  if (error) throw error;
  return data;
}

// ============================================
// Search & Profile
// ============================================

export async function searchProviders(
  request: SearchProvidersRequest
): Promise<ProviderSearchResult[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('search_providers_by_specialties', {
    p_search_text: request.search_text || null,
    p_category_ids: request.category_ids || null,
    p_specialty_tags: request.specialty_tags || null,
    p_user_lat: request.user_lat || null,
    p_user_lng: request.user_lng || null,
    p_radius_km: request.radius_km || 20,
    p_min_rating: request.min_rating || 0,
    p_experience_level: request.experience_level || null,
    p_show_closed: request.show_closed ?? true,
    p_sort_by: request.sort_by || 'relevance',
    p_limit: request.limit || 20,
    p_offset: request.offset || 0,
  });

  if (error) throw error;
  return data as ProviderSearchResult[];
}

export async function getCompleteProviderProfile(
  providerId: string
): Promise<CompleteProviderProfile> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    'get_provider_profile_with_specialties',
    {
      p_provider_id: providerId,
    }
  );

  if (error) throw error;
  return data as CompleteProviderProfile;
}
