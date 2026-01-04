'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  ProviderStatus,
  ProviderSchedule,
  UpdateStatusParams,
  SetScheduleParams,
  STATUS_VALIDATION,
} from '@/types/provider-status';

// Get provider status
export async function getProviderStatus(providerId: string) {
  try {
    const supabase = await createClient();

    const { data: status, error } = await supabase
      .from('provider_status')
      .select('*')
      .eq('provider_id', providerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is OK
      console.error('Error fetching provider status:', error);
      return { success: false, error: 'Erro ao buscar status' };
    }

    // If no status exists, return default
    if (!status) {
      return {
        success: true,
        status: {
          provider_id: providerId,
          is_open: false,
          status_type: 'closed',
          status_message: null,
          auto_close_at: null,
          updated_at: new Date().toISOString(),
        } as ProviderStatus,
      };
    }

    return {
      success: true,
      status: status as ProviderStatus,
    };
  } catch (error) {
    console.error('Unexpected error fetching provider status:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar status',
    };
  }
}

// Toggle provider status (quick open/close)
export async function toggleProviderStatus() {
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
    const { data, error } = await supabase.rpc('toggle_provider_status', {
      p_provider_id: user.id,
    });

    if (error) {
      console.error('Error toggling status:', error);
      return { success: false, error: 'Erro ao alternar status' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/providers/[id]', 'page');

    return {
      success: true,
      status: data[0],
    };
  } catch (error) {
    console.error('Unexpected error toggling status:', error);
    return {
      success: false,
      error: 'Erro inesperado ao alternar status',
    };
  }
}

// Update provider status with full control
export async function updateProviderStatus(params: UpdateStatusParams) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Validate message length
    if (
      params.status_message &&
      params.status_message.length > STATUS_VALIDATION.MAX_MESSAGE_LENGTH
    ) {
      return {
        success: false,
        error: `Mensagem deve ter no máximo ${STATUS_VALIDATION.MAX_MESSAGE_LENGTH} caracteres`,
      };
    }

    // Validate auto_close_hours
    if (params.auto_close_hours !== undefined) {
      if (
        params.auto_close_hours < STATUS_VALIDATION.MIN_AUTO_CLOSE_HOURS ||
        params.auto_close_hours > STATUS_VALIDATION.MAX_AUTO_CLOSE_HOURS
      ) {
        return {
          success: false,
          error: `Fechamento automático deve ser entre ${STATUS_VALIDATION.MIN_AUTO_CLOSE_HOURS} e ${STATUS_VALIDATION.MAX_AUTO_CLOSE_HOURS} horas`,
        };
      }
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('update_provider_status', {
      p_provider_id: user.id,
      p_status_type: params.status_type,
      p_status_message: params.status_message || null,
      p_auto_close_hours: params.auto_close_hours || null,
    });

    if (error) {
      console.error('Error updating status:', error);
      return { success: false, error: 'Erro ao atualizar status' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/providers/[id]', 'page');

    return {
      success: true,
      status: data[0],
    };
  } catch (error) {
    console.error('Unexpected error updating status:', error);
    return {
      success: false,
      error: 'Erro inesperado ao atualizar status',
    };
  }
}

// Get provider schedule
export async function getProviderSchedule(providerId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_provider_schedule', {
      p_provider_id: providerId,
    });

    if (error) {
      console.error('Error fetching schedule:', error);
      return { success: false, error: 'Erro ao buscar horários' };
    }

    return {
      success: true,
      schedule: (data || []) as ProviderSchedule[],
    };
  } catch (error) {
    console.error('Unexpected error fetching schedule:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar horários',
    };
  }
}

// Set provider schedule for a specific day
export async function setProviderSchedule(params: SetScheduleParams) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Validate day_of_week
    if (params.day_of_week < 0 || params.day_of_week > 6) {
      return {
        success: false,
        error: 'Dia da semana inválido (0-6)',
      };
    }

    // Validate time format (HH:MM or HH:MM:SS)
    // Accept both formats as HTML time inputs may include seconds
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(params.open_time) || !timeRegex.test(params.close_time)) {
      return {
        success: false,
        error: 'Formato de hora inválido (use HH:MM)',
      };
    }

    // Normalize time format to HH:MM (remove seconds if present)
    const normalizeTime = (time: string) => time.substring(0, 5);
    const normalizedOpenTime = normalizeTime(params.open_time);
    const normalizedCloseTime = normalizeTime(params.close_time);

    // Validate time range
    if (normalizedCloseTime <= normalizedOpenTime) {
      return {
        success: false,
        error: 'Horário de fechamento deve ser após o de abertura',
      };
    }

    // Call SQL function with normalized times
    const { data, error } = await supabase.rpc('set_provider_schedule', {
      p_provider_id: user.id,
      p_day_of_week: params.day_of_week,
      p_open_time: normalizedOpenTime,
      p_close_time: normalizedCloseTime,
      p_is_active: params.is_active !== undefined ? params.is_active : true,
    });

    if (error) {
      console.error('Error setting schedule:', error);
      return { success: false, error: 'Erro ao configurar horário' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/settings');

    return {
      success: true,
      schedule: data[0] as ProviderSchedule,
    };
  } catch (error) {
    console.error('Unexpected error setting schedule:', error);
    return {
      success: false,
      error: 'Erro inesperado ao configurar horário',
    };
  }
}

// Delete provider schedule for a specific day
export async function deleteProviderSchedule(dayOfWeek: number) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    const { error } = await supabase
      .from('provider_schedule')
      .delete()
      .eq('provider_id', user.id)
      .eq('day_of_week', dayOfWeek);

    if (error) {
      console.error('Error deleting schedule:', error);
      return { success: false, error: 'Erro ao remover horário' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/settings');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting schedule:', error);
    return {
      success: false,
      error: 'Erro inesperado ao remover horário',
    };
  }
}

// Enable/disable automatic status
export async function toggleAutoStatus(enabled: boolean) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Update provider_settings
    const { error } = await supabase
      .from('provider_settings')
      .upsert({
        provider_id: user.id,
        auto_status_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('provider_id', user.id);

    if (error) {
      console.error('Error toggling auto status:', error);
      return { success: false, error: 'Erro ao alterar modo automático' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/settings');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error toggling auto status:', error);
    return {
      success: false,
      error: 'Erro inesperado ao alterar modo automático',
    };
  }
}

// Get provider settings (including auto_status_enabled)
export async function getProviderSettings(providerId: string) {
  try {
    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from('provider_settings')
      .select('auto_status_enabled, timezone')
      .eq('provider_id', providerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching provider settings:', error);
      return { success: false, error: 'Erro ao buscar configurações' };
    }

    // If no settings exist, return defaults
    if (!settings) {
      return {
        success: true,
        settings: {
          auto_status_enabled: false,
          timezone: 'Europe/Lisbon',
        },
      };
    }

    return {
      success: true,
      settings,
    };
  } catch (error) {
    console.error('Unexpected error fetching provider settings:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar configurações',
    };
  }
}

// Update provider timezone
export async function updateProviderTimezone(timezone: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Update provider_settings
    const { error } = await supabase
      .from('provider_settings')
      .upsert({
        provider_id: user.id,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('provider_id', user.id);

    if (error) {
      console.error('Error updating timezone:', error);
      return { success: false, error: 'Erro ao atualizar fuso horário' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/settings');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating timezone:', error);
    return {
      success: false,
      error: 'Erro inesperado ao atualizar fuso horário',
    };
  }
}
