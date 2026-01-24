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
    const week = parseInt(searchParams.get('week') || '');

    if (!year || isNaN(month) || isNaN(week)) {
      return NextResponse.json(
        { success: false, error: 'Year, month, and week are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Calculate week dates - weeks start on Monday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: any[] = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    let currentWeek = 0;
    let weekDays: Date[] = [];

    // Iterate through all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      
      weekDays.push(new Date(date)); // Create new date object to avoid mutation

      // Week ends on Sunday (0) or it's the last day of the month
      if (dayOfWeek === 0 || day === daysInMonth) {
        currentWeek++;
        
        if (currentWeek === week) {
          // This is the week we want
          weekDays.forEach((d) => {
            const dateObj = new Date(d);
            const startDate = new Date(dateObj);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(dateObj);
            endDate.setHours(23, 59, 59, 999);
            
            days.push({
              date: dateObj.toISOString().split('T')[0],
              day: `${dayNames[dateObj.getDay()]} ${dateObj.getDate()}`,
              dayOfWeek: dayNames[dateObj.getDay()],
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            });
          });
          break;
        }
        weekDays = [];
      }
    }

    if (days.length === 0) {
      return NextResponse.json({
        success: true,
        days: [],
      });
    }

    // Fetch bookings for the week
    const weekStart = days[0].startDate;
    const weekEnd = days[days.length - 1].endDate;

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('status, created_at')
      .eq('provider_id', providerId)
      .gte('created_at', weekStart)
      .lte('created_at', weekEnd);

    if (error) {
      console.error('Error fetching bookings:', error);
    }

    // Aggregate bookings by day
    const daysData = days.map((day) => {
      const dayBookings = bookings?.filter(
        (b) => b.created_at >= day.startDate && b.created_at <= day.endDate
      ) || [];

      return {
        date: day.date,
        day: day.day,
        dayOfWeek: day.dayOfWeek,
        pending: dayBookings.filter((b) => b.status === 'pending').length,
        confirmed: dayBookings.filter((b) => b.status === 'confirmed').length,
        completed: dayBookings.filter((b) => b.status === 'completed').length,
        cancelled: dayBookings.filter((b) => b.status === 'cancelled').length,
        total: dayBookings.length,
      };
    });

    return NextResponse.json({
      success: true,
      days: daysData,
    });
  } catch (error) {
    console.error('Error fetching daily bookings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch daily bookings',
        days: [],
      },
      { status: 500 }
    );
  }
}
