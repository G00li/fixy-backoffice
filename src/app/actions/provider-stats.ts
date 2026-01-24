'use server';

import { createClient } from '@/lib/supabase/server';

export interface ProviderStats {
  totalPosts: number;
  totalViews: number;
  averageRating: number;
  totalBookings: number;
}

/**
 * Get provider dashboard statistics
 * Fetches real data from Supabase tables
 */
export async function getProviderStats(providerId: string) {
  try {
    const supabase = await createClient();

    // Fetch total posts and views
    const { data: posts, error: postsError } = await supabase
      .from('provider_posts')
      .select('views_count')
      .eq('provider_id', providerId)
      .eq('is_active', true);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
    }

    const totalPosts = posts?.length || 0;
    const totalViews = posts?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0;

    // Fetch average rating from reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('overall_rating')
      .eq('provider_id', providerId);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    let averageRating = 0;
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.overall_rating || 0), 0);
      averageRating = totalRating / reviews.length;
    }

    // Fetch total bookings
    const { count: totalBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
    }

    return {
      success: true,
      stats: {
        totalPosts,
        totalViews,
        averageRating,
        totalBookings: totalBookings || 0,
      } as ProviderStats,
    };
  } catch (error) {
    console.error('Unexpected error fetching provider stats:', error);
    return {
      success: false,
      error: 'Erro ao buscar estatísticas',
      stats: {
        totalPosts: 0,
        totalViews: 0,
        averageRating: 0,
        totalBookings: 0,
      } as ProviderStats,
    };
  }
}
