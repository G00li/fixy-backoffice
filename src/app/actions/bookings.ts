'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  Booking,
  BookingWithDetails,
  AvailableSlot,
  BlockedTimeSlot,
  CreateBookingParams,
  CreateBookingResponse,
  GetAvailableSlotsParams,
  ApproveBookingResponse,
  RejectBookingParams,
  CancelBookingParams,
  BlockTimeSlotParams,
  BlockTimeSlotResponse,
  BookingFilters,
} from '@/types/bookings';

// ============================================================================
// GET AVAILABLE SLOTS
// ============================================================================

export async function getAvailableSlots(params: GetAvailableSlotsParams) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_available_slots', {
      p_provider_id: params.provider_id,
      p_date: params.date,
      p_service_id: params.service_id || null,
    });

    if (error) {
      console.error('Error fetching available slots:', error);
      return { success: false, error: 'Erro ao buscar horários disponíveis' };
    }

    return {
      success: true,
      slots: (data || []) as AvailableSlot[],
    };
  } catch (error) {
    console.error('Unexpected error fetching available slots:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar horários disponíveis',
    };
  }
}

// ============================================================================
// CREATE BOOKING
// ============================================================================

export async function createBooking(params: CreateBookingParams) {
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
    const { data, error } = await supabase.rpc('create_booking', {
      p_client_id: user.id,
      p_provider_id: params.provider_id,
      p_service_id: params.service_id,
      p_start_time: params.start_time,
      p_end_time: params.end_time,
      p_notes: params.notes || null,
      p_address: params.address || null,
    });

    if (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: 'Erro ao criar agendamento' };
    }

    const result = data[0] as CreateBookingResponse;

    if (!result.booking_id) {
      return { success: false, error: result.message };
    }

    revalidatePath('/bookings');
    revalidatePath('/providers/[id]/schedule', 'page');

    return {
      success: true,
      booking_id: result.booking_id,
      status: result.status,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error creating booking:', error);
    return {
      success: false,
      error: 'Erro inesperado ao criar agendamento',
    };
  }
}

// ============================================================================
// GET PROVIDER BOOKINGS
// ============================================================================

export async function getProviderBookings(filters?: BookingFilters) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    let query = supabase
      .from('provider_bookings_view')
      .select('*')
      .eq('provider_id', user.id)
      .order('start_time', { ascending: false });

    // Apply filters
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters?.start_date) {
      query = query.gte('start_time', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('start_time', filters.end_date);
    }

    if (filters?.service_id) {
      query = query.eq('service_id', filters.service_id);
    }

    if (filters?.search) {
      query = query.or(
        `client_name.ilike.%${filters.search}%,client_email.ilike.%${filters.search}%,service_title.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching provider bookings:', error);
      return { success: false, error: 'Erro ao buscar agendamentos' };
    }

    return {
      success: true,
      bookings: (data || []) as BookingWithDetails[],
    };
  } catch (error) {
    console.error('Unexpected error fetching provider bookings:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar agendamentos',
    };
  }
}

// ============================================================================
// GET CLIENT BOOKINGS
// ============================================================================

export async function getClientBookings(filters?: BookingFilters) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    let query = supabase
      .from('bookings')
      .select(`
        *,
        provider:profiles!provider_id(full_name, email, phone, avatar_url, business_name),
        service:services(title, duration_min, price)
      `)
      .eq('client_id', user.id)
      .order('start_time', { ascending: false });

    // Apply filters
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters?.start_date) {
      query = query.gte('start_time', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('start_time', filters.end_date);
    }

    if (filters?.service_id) {
      query = query.eq('service_id', filters.service_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching client bookings:', error);
      return { success: false, error: 'Erro ao buscar agendamentos' };
    }

    return {
      success: true,
      bookings: (data || []) as any[], // Type will be complex with joins
    };
  } catch (error) {
    console.error('Unexpected error fetching client bookings:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar agendamentos',
    };
  }
}

// ============================================================================
// GET BOOKING BY ID
// ============================================================================

export async function getBookingById(bookingId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('provider_bookings_view')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return { success: false, error: 'Erro ao buscar agendamento' };
    }

    return {
      success: true,
      booking: data as BookingWithDetails,
    };
  } catch (error) {
    console.error('Unexpected error fetching booking:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar agendamento',
    };
  }
}

// ============================================================================
// APPROVE BOOKING
// ============================================================================

export async function approveBooking(bookingId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('approve_booking', {
      p_booking_id: bookingId,
    });

    if (error) {
      console.error('Error approving booking:', error);
      return { success: false, error: 'Erro ao aprovar agendamento' };
    }

    const result = data[0] as ApproveBookingResponse;

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/providers/[id]/schedule', 'page');
    revalidatePath('/bookings');

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error approving booking:', error);
    return {
      success: false,
      error: 'Erro inesperado ao aprovar agendamento',
    };
  }
}

// ============================================================================
// REJECT BOOKING
// ============================================================================

export async function rejectBooking(params: RejectBookingParams) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('reject_booking', {
      p_booking_id: params.booking_id,
      p_reason: params.reason || null,
    });

    if (error) {
      console.error('Error rejecting booking:', error);
      return { success: false, error: 'Erro ao recusar agendamento' };
    }

    const result = data[0] as ApproveBookingResponse;

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/providers/[id]/schedule', 'page');
    revalidatePath('/bookings');

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error rejecting booking:', error);
    return {
      success: false,
      error: 'Erro inesperado ao recusar agendamento',
    };
  }
}

// ============================================================================
// CANCEL BOOKING
// ============================================================================

export async function cancelBooking(params: CancelBookingParams) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('cancel_booking', {
      p_booking_id: params.booking_id,
      p_reason: params.reason || null,
    });

    if (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: 'Erro ao cancelar agendamento' };
    }

    const result = data[0] as ApproveBookingResponse;

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/providers/[id]/schedule', 'page');
    revalidatePath('/bookings');

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error cancelling booking:', error);
    return {
      success: false,
      error: 'Erro inesperado ao cancelar agendamento',
    };
  }
}

// ============================================================================
// BLOCK TIME SLOT
// ============================================================================

export async function blockTimeSlot(params: BlockTimeSlotParams) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { data, error } = await supabase.rpc('block_time_slot', {
      p_provider_id: user.id,
      p_start_time: params.start_time,
      p_end_time: params.end_time,
      p_reason: params.reason || null,
      p_is_recurring: params.is_recurring || false,
      p_recurrence_pattern: params.recurrence_pattern || null,
    });

    if (error) {
      console.error('Error blocking time slot:', error);
      return { success: false, error: 'Erro ao bloquear horário' };
    }

    const result = data[0] as BlockTimeSlotResponse;

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/providers/[id]/schedule', 'page');

    return {
      success: true,
      slot_id: result.slot_id,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error blocking time slot:', error);
    return {
      success: false,
      error: 'Erro inesperado ao bloquear horário',
    };
  }
}

// ============================================================================
// UNBLOCK TIME SLOT
// ============================================================================

export async function unblockTimeSlot(slotId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('unblock_time_slot', {
      p_slot_id: slotId,
    });

    if (error) {
      console.error('Error unblocking time slot:', error);
      return { success: false, error: 'Erro ao desbloquear horário' };
    }

    const result = data[0] as ApproveBookingResponse;

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/providers/[id]/schedule', 'page');

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Unexpected error unblocking time slot:', error);
    return {
      success: false,
      error: 'Erro inesperado ao desbloquear horário',
    };
  }
}

// ============================================================================
// GET BLOCKED SLOTS
// ============================================================================

export async function getBlockedSlots(providerId: string, startDate?: string, endDate?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('blocked_time_slots')
      .select('*')
      .eq('provider_id', providerId)
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('end_time', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching blocked slots:', error);
      return { success: false, error: 'Erro ao buscar horários bloqueados' };
    }

    return {
      success: true,
      slots: (data || []) as BlockedTimeSlot[],
    };
  } catch (error) {
    console.error('Unexpected error fetching blocked slots:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar horários bloqueados',
    };
  }
}

// ============================================================================
// COMPLETE BOOKING
// ============================================================================

export async function completeBooking(bookingId: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Verify user is the provider
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('provider_id, status')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: 'Agendamento não encontrado' };
    }

    if (booking.provider_id !== user.id) {
      return { success: false, error: 'Não autorizado' };
    }

    if (booking.status !== 'confirmed') {
      return { success: false, error: 'Apenas agendamentos confirmados podem ser concluídos' };
    }

    // Update status to completed
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error completing booking:', updateError);
      return { success: false, error: 'Erro ao concluir agendamento' };
    }

    revalidatePath('/providers/[id]/schedule', 'page');
    revalidatePath('/bookings');

    return {
      success: true,
      message: 'Agendamento concluído com sucesso',
    };
  } catch (error) {
    console.error('Unexpected error completing booking:', error);
    return {
      success: false,
      error: 'Erro inesperado ao concluir agendamento',
    };
  }
}
