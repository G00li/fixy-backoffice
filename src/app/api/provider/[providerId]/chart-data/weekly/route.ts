import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  try {
    const { providerId } = await params;
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (!year || isNaN(month)) {
      return NextResponse.json(
        { success: false, error: 'Year and month are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get all days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: any[] = [];

    // Group days into weeks
    let currentWeek: Date[] = [];
    let weekNumber = 1;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      currentWeek.push(date);

      // If it's Sunday or last day of month, close the week
      if (date.getDay() === 0 || day === daysInMonth) {
        const startDate = currentWeek[0];
        const endDate = currentWeek[currentWeek.length - 1];

        weeks.push({
          weekNumber,
          week: `Semana ${weekNumber}`,
          dateRange: `${startDate.getDate()}-${endDate.getDate()}`,
          startDate: new Date(startDate.setHours(0, 0, 0, 0)).toISOString(),
          endDate: new Date(endDate.setHours(23, 59, 59, 999)).toISOString(),
        });

        currentWeek = [];
        weekNumber++;
      }
    }

    // Fetch bookings for the entire month
    const monthStart = new Date(year, month, 1).toISOString();
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('status, created_at')
      .eq('provider_id', providerId)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd);

    if (error) {
      console.error('Error fetching bookings:', error);
    }

    // Aggregate bookings by week
    const weeksData = weeks.map((week) => {
      const weekBookings = bookings?.filter(
        (b) => b.created_at >= week.startDate && b.created_at <= week.endDate
      ) || [];

      return {
        ...week,
        pending: weekBookings.filter((b) => b.status === 'pending').length,
        confirmed: weekBookings.filter((b) => b.status === 'confirmed').length,
        completed: weekBookings.filter((b) => b.status === 'completed').length,
        cancelled: weekBookings.filter((b) => b.status === 'cancelled').length,
        total: weekBookings.length,
      };
    });

    return NextResponse.json({
      success: true,
      weeks: weeksData,
    });
  } catch (error) {
    console.error('Error fetching weekly bookings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weekly bookings',
        weeks: [],
      },
      { status: 500 }
    );
  }
}
