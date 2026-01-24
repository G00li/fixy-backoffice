import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  try {
    const { providerId } = await params;
    const supabase = await createClient();

    // Get last 12 months
    const months = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString(),
      });
    }

    // Fetch bookings data
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('status, created_at')
      .eq('provider_id', providerId)
      .gte('created_at', months[0].startDate);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
    }

    // Aggregate bookings by month and status
    const bookingsData = months.map(({ month, startDate, endDate }) => {
      const monthBookings = bookings?.filter(
        (b) => b.created_at >= startDate && b.created_at <= endDate
      ) || [];

      return {
        month,
        pending: monthBookings.filter((b) => b.status === 'pending').length,
        confirmed: monthBookings.filter((b) => b.status === 'confirmed').length,
        completed: monthBookings.filter((b) => b.status === 'completed').length,
        cancelled: monthBookings.filter((b) => b.status === 'cancelled').length,
        total: monthBookings.length,
      };
    });

    // Fetch reviews data
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('overall_rating, created_at')
      .eq('provider_id', providerId)
      .gte('created_at', months[0].startDate);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    // Aggregate reviews by month
    const reviewsData = months.map(({ month, startDate, endDate }) => {
      const monthReviews = reviews?.filter(
        (r) => r.created_at >= startDate && r.created_at <= endDate
      ) || [];

      const totalRating = monthReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
      const avgRating = monthReviews.length > 0 ? totalRating / monthReviews.length : 0;

      return {
        month,
        average_rating: avgRating,
        total_reviews: monthReviews.length,
      };
    });

    return NextResponse.json({
      success: true,
      chartData: {
        bookings: bookingsData,
        reviews: reviewsData,
      },
    });
  } catch (error) {
    console.error('Error fetching provider chart data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch provider chart data',
        chartData: {
          bookings: [],
          reviews: [],
        },
      },
      { status: 500 }
    );
  }
}
