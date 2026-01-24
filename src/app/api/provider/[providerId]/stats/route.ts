import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  try {
    const { providerId } = await params;
    const supabase = await createClient();

    // Fetch reviews statistics
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('overall_rating')
      .eq('provider_id', providerId);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    let avgRating = 0;
    const totalReviews = reviews?.length || 0;
    
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.overall_rating || 0), 0);
      avgRating = totalRating / reviews.length;
    }

    // Fetch bookings statistics
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('status')
      .eq('provider_id', providerId);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
    }

    const totalBookings = bookings?.length || 0;
    const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;

    // Fetch followers count (assuming there's a followers table or similar)
    // For now, we'll use a placeholder
    const followersCount = 0;

    // Fetch posts statistics
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

    return NextResponse.json({
      success: true,
      stats: {
        avg_rating: avgRating,
        total_reviews: totalReviews,
        total_bookings: totalBookings,
        completed_bookings: completedBookings,
        followers_count: followersCount,
        total_posts: totalPosts,
        total_views: totalViews,
      },
    });
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch provider statistics',
        stats: {
          avg_rating: 0,
          total_reviews: 0,
          total_bookings: 0,
          completed_bookings: 0,
          followers_count: 0,
          total_posts: 0,
          total_views: 0,
        },
      },
      { status: 500 }
    );
  }
}
