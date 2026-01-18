'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  Review,
  ReviewWithDetails,
  ReviewStats,
  CreateReviewParams,
  CreateReviewResponse,
  UpdateReviewParams,
  RespondToReviewParams,
  FlagReviewParams,
  GetProviderReviewsParams,
} from '@/types/reviews';

// ============================================================================
// CREATE REVIEW
// ============================================================================

export async function createReview(params: CreateReviewParams) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('create_review', {
      p_booking_id: params.booking_id,
      p_quality_rating: params.quality_rating,
      p_punctuality_rating: params.punctuality_rating,
      p_communication_rating: params.communication_rating,
      p_value_rating: params.value_rating,
      p_comment: params.comment || null,
      p_images: params.images || [],
    });

    if (error) {
      console.error('Error creating review:', error);
      return { success: false, error: 'Erro ao criar avaliação' };
    }

    const result = data[0] as CreateReviewResponse;

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/bookings');
    revalidatePath('/providers/[id]', 'page');

    return {
      success: true,
      review_id: result.review_id,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error creating review:', error);
    return {
      success: false,
      error: 'Erro inesperado ao criar avaliação',
    };
  }
}

// ============================================================================
// UPDATE REVIEW
// ============================================================================

export async function updateReview(params: UpdateReviewParams) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('update_review', {
      p_review_id: params.review_id,
      p_quality_rating: params.quality_rating,
      p_punctuality_rating: params.punctuality_rating,
      p_communication_rating: params.communication_rating,
      p_value_rating: params.value_rating,
      p_comment: params.comment || null,
      p_images: params.images || [],
    });

    if (error) {
      console.error('Error updating review:', error);
      return { success: false, error: 'Erro ao atualizar avaliação' };
    }

    const result = data[0] as { success: boolean; message: string };

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/bookings');
    revalidatePath('/providers/[id]', 'page');

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error updating review:', error);
    return {
      success: false,
      error: 'Erro inesperado ao atualizar avaliação',
    };
  }
}

// ============================================================================
// GET PROVIDER REVIEWS
// ============================================================================

export async function getProviderReviews(params: GetProviderReviewsParams) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_provider_reviews', {
      p_provider_id: params.provider_id,
      p_min_rating: params.min_rating || 1,
      p_with_photos_only: params.with_photos_only || false,
      p_limit: params.limit || 20,
      p_offset: params.offset || 0,
    });

    if (error) {
      console.error('Error fetching provider reviews:', error);
      return { success: false, error: 'Erro ao buscar avaliações' };
    }

    return {
      success: true,
      reviews: (data || []) as ReviewWithDetails[],
    };
  } catch (error) {
    console.error('Unexpected error fetching provider reviews:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar avaliações',
    };
  }
}

// ============================================================================
// GET REVIEW BY ID
// ============================================================================

export async function getReviewById(reviewId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reviews_with_details')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (error) {
      console.error('Error fetching review:', error);
      return { success: false, error: 'Erro ao buscar avaliação' };
    }

    return {
      success: true,
      review: data as ReviewWithDetails,
    };
  } catch (error) {
    console.error('Unexpected error fetching review:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar avaliação',
    };
  }
}

// ============================================================================
// GET REVIEW BY BOOKING ID
// ============================================================================

export async function getReviewByBookingId(bookingId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reviews_with_details')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error) {
      // Not found is not an error in this case
      if (error.code === 'PGRST116') {
        return { success: true, review: null };
      }
      console.error('Error fetching review by booking:', error);
      return { success: false, error: 'Erro ao buscar avaliação' };
    }

    return {
      success: true,
      review: data as ReviewWithDetails,
    };
  } catch (error) {
    console.error('Unexpected error fetching review by booking:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar avaliação',
    };
  }
}

// ============================================================================
// RESPOND TO REVIEW (PROVIDER)
// ============================================================================

export async function respondToReview(params: RespondToReviewParams) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('respond_to_review', {
      p_review_id: params.review_id,
      p_response: params.response,
    });

    if (error) {
      console.error('Error responding to review:', error);
      return { success: false, error: 'Erro ao responder avaliação' };
    }

    const result = data[0] as { success: boolean; message: string };

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/providers/[id]', 'page');

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error responding to review:', error);
    return {
      success: false,
      error: 'Erro inesperado ao responder avaliação',
    };
  }
}

// ============================================================================
// FLAG REVIEW
// ============================================================================

export async function flagReview(params: FlagReviewParams) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('flag_review', {
      p_review_id: params.review_id,
      p_reason: params.reason,
    });

    if (error) {
      console.error('Error flagging review:', error);
      return { success: false, error: 'Erro ao reportar avaliação' };
    }

    const result = data[0] as { success: boolean; message: string };

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/providers/[id]', 'page');

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error flagging review:', error);
    return {
      success: false,
      error: 'Erro inesperado ao reportar avaliação',
    };
  }
}

// ============================================================================
// GET REVIEW STATS
// ============================================================================

export async function getReviewStats(providerId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_review_stats', {
      p_provider_id: providerId,
    });

    if (error) {
      console.error('Error fetching review stats:', error);
      return { success: false, error: 'Erro ao buscar estatísticas' };
    }

    const stats = data[0] as ReviewStats;

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Unexpected error fetching review stats:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar estatísticas',
    };
  }
}

// ============================================================================
// GET MY REVIEWS (AS REVIEWER)
// ============================================================================

export async function getMyReviews() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { data, error } = await supabase
      .from('reviews_with_details')
      .select('*')
      .eq('reviewer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my reviews:', error);
      return { success: false, error: 'Erro ao buscar minhas avaliações' };
    }

    return {
      success: true,
      reviews: (data || []) as ReviewWithDetails[],
    };
  } catch (error) {
    console.error('Unexpected error fetching my reviews:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar minhas avaliações',
    };
  }
}

// ============================================================================
// DELETE REVIEW (SOFT DELETE - FLAG AS DELETED)
// ============================================================================

export async function deleteReview(reviewId: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Verify ownership
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('reviewer_id, provider_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      return { success: false, error: 'Avaliação não encontrada' };
    }

    if (review.reviewer_id !== user.id) {
      return { success: false, error: 'Não autorizado' };
    }

    // Delete review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return { success: false, error: 'Erro ao excluir avaliação' };
    }

    // Update provider rating
    await supabase.rpc('update_provider_rating', {
      p_provider_id: review.provider_id,
    });

    revalidatePath('/bookings');
    revalidatePath('/providers/[id]', 'page');

    return {
      success: true,
      message: 'Avaliação excluída com sucesso',
    };
  } catch (error) {
    console.error('Unexpected error deleting review:', error);
    return {
      success: false,
      error: 'Erro inesperado ao excluir avaliação',
    };
  }
}
