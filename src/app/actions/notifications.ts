'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  Notification,
  NotificationPreference,
  NotificationRule,
  NotificationStats,
  CreateNotificationRequest,
  CreateNotificationResponse,
  GetNotificationsRequest,
  GetNotificationsResponse,
  MarkNotificationReadRequest,
  MarkNotificationReadResponse,
  DismissNotificationRequest,
  DismissNotificationResponse,
  GetUnreadCountRequest,
  GetUnreadCountResponse,
  MarkAllReadRequest,
  MarkAllReadResponse,
  UpdateNotificationPreferenceRequest,
  UpdateNotificationPreferenceResponse,
  GetUserPreferencesRequest,
  GetUserPreferencesResponse,
  GetNotificationStatsResponse,
  NotificationPriority,
} from '@/types/notifications';

// ============================================================================
// GET NOTIFICATIONS
// ============================================================================

export async function getNotifications(
  params: GetNotificationsRequest
): Promise<GetNotificationsResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, notifications: [], error: 'Não autenticado' };
    }

    // Verify user_id matches authenticated user (security)
    if (params.user_id !== user.id) {
      return {
        success: false,
        notifications: [],
        error: 'Não autorizado',
      };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('get_notifications_v2', {
      p_user_id: params.user_id,
      p_unread_only: params.unread_only || false,
      p_priority: params.priority || null,
      p_notification_type: params.notification_type || null,
      p_limit: params.limit || 20,
      p_offset: params.offset || 0,
    });

    if (error) {
      console.error('Error getting notifications:', error);
      return {
        success: false,
        notifications: [],
        error: 'Erro ao buscar notificações',
      };
    }

    return {
      success: true,
      notifications: data as Notification[],
    };
  } catch (error) {
    console.error('Unexpected error getting notifications:', error);
    return {
      success: false,
      notifications: [],
      error: 'Erro inesperado ao buscar notificações',
    };
  }
}

// ============================================================================
// GET UNREAD COUNT
// ============================================================================

export async function getUnreadCount(
  params: GetUnreadCountRequest
): Promise<GetUnreadCountResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, count: 0, error: 'Não autenticado' };
    }

    // Verify user_id matches authenticated user (security)
    if (params.user_id !== user.id) {
      return { success: false, count: 0, error: 'Não autorizado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('get_unread_count_v2', {
      p_user_id: params.user_id,
      p_priority: params.priority || null,
    });

    if (error) {
      console.error('Error getting unread count:', error);
      return {
        success: false,
        count: 0,
        error: 'Erro ao buscar contador',
      };
    }

    return {
      success: true,
      count: data as number,
    };
  } catch (error) {
    console.error('Unexpected error getting unread count:', error);
    return {
      success: false,
      count: 0,
      error: 'Erro inesperado ao buscar contador',
    };
  }
}

// ============================================================================
// MARK NOTIFICATION AS READ
// ============================================================================

export async function markNotificationAsRead(
  params: MarkNotificationReadRequest
): Promise<MarkNotificationReadResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Verify user_id matches authenticated user (security)
    if (params.user_id !== user.id) {
      return { success: false, error: 'Não autorizado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('mark_notification_read_v2', {
      p_notification_id: params.notification_id,
      p_user_id: params.user_id,
      p_clicked: params.clicked || false,
    });

    if (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: 'Erro ao marcar como lida',
      };
    }

    revalidatePath('/notifications');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error marking notification as read:', error);
    return {
      success: false,
      error: 'Erro inesperado ao marcar como lida',
    };
  }
}

// ============================================================================
// MARK ALL AS READ
// ============================================================================

export async function markAllNotificationsAsRead(
  params: MarkAllReadRequest
): Promise<MarkAllReadResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, count: 0, error: 'Não autenticado' };
    }

    // Verify user_id matches authenticated user (security)
    if (params.user_id !== user.id) {
      return { success: false, count: 0, error: 'Não autorizado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('mark_all_read_v2', {
      p_user_id: params.user_id,
      p_notification_type: params.notification_type || null,
    });

    if (error) {
      console.error('Error marking all as read:', error);
      return {
        success: false,
        count: 0,
        error: 'Erro ao marcar todas como lidas',
      };
    }

    revalidatePath('/notifications');

    return {
      success: true,
      count: data as number,
    };
  } catch (error) {
    console.error('Unexpected error marking all as read:', error);
    return {
      success: false,
      count: 0,
      error: 'Erro inesperado ao marcar todas como lidas',
    };
  }
}

// ============================================================================
// DISMISS NOTIFICATION
// ============================================================================

export async function dismissNotification(
  params: DismissNotificationRequest
): Promise<DismissNotificationResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Verify user_id matches authenticated user (security)
    if (params.user_id !== user.id) {
      return { success: false, error: 'Não autorizado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('dismiss_notification', {
      p_notification_id: params.notification_id,
      p_user_id: params.user_id,
    });

    if (error) {
      console.error('Error dismissing notification:', error);
      return {
        success: false,
        error: 'Erro ao dismissar notificação',
      };
    }

    revalidatePath('/notifications');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error dismissing notification:', error);
    return {
      success: false,
      error: 'Erro inesperado ao dismissar notificação',
    };
  }
}

// ============================================================================
// GET USER PREFERENCES
// ============================================================================

export async function getUserNotificationPreferences(
  params: GetUserPreferencesRequest
): Promise<GetUserPreferencesResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, preferences: [], error: 'Não autenticado' };
    }

    // Verify user_id matches authenticated user (security)
    if (params.user_id !== user.id) {
      return {
        success: false,
        preferences: [],
        error: 'Não autorizado',
      };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc(
      'get_user_notification_preferences',
      {
        p_user_id: params.user_id,
      }
    );

    if (error) {
      console.error('Error getting preferences:', error);
      return {
        success: false,
        preferences: [],
        error: 'Erro ao buscar preferências',
      };
    }

    return {
      success: true,
      preferences: data as NotificationPreference[],
    };
  } catch (error) {
    console.error('Unexpected error getting preferences:', error);
    return {
      success: false,
      preferences: [],
      error: 'Erro inesperado ao buscar preferências',
    };
  }
}

// ============================================================================
// UPDATE NOTIFICATION PREFERENCE
// ============================================================================

export async function updateNotificationPreference(
  params: UpdateNotificationPreferenceRequest
): Promise<UpdateNotificationPreferenceResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Verify user_id matches authenticated user (security)
    if (params.user_id !== user.id) {
      return { success: false, error: 'Não autorizado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc(
      'update_notification_preference',
      {
        p_user_id: params.user_id,
        p_notification_type: params.notification_type,
        p_enabled: params.enabled ?? null,
        p_channels: params.channels ?? null,
        p_quiet_hours_start: params.quiet_hours_start ?? null,
        p_quiet_hours_end: params.quiet_hours_end ?? null,
      }
    );

    if (error) {
      console.error('Error updating preference:', error);
      return {
        success: false,
        error: 'Erro ao atualizar preferência',
      };
    }

    revalidatePath('/settings/notifications');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error updating preference:', error);
    return {
      success: false,
      error: 'Erro inesperado ao atualizar preferência',
    };
  }
}

// ============================================================================
// GET NOTIFICATION STATS
// ============================================================================

export async function getNotificationStats(
  userId: string
): Promise<GetNotificationStatsResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, stats: null, error: 'Não autenticado' };
    }

    // Verify user_id matches authenticated user (security)
    if (userId !== user.id) {
      return { success: false, stats: null, error: 'Não autorizado' };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('get_notification_stats', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error getting notification stats:', error);
      return {
        success: false,
        stats: null,
        error: 'Erro ao buscar estatísticas',
      };
    }

    return {
      success: true,
      stats: data as NotificationStats,
    };
  } catch (error) {
    console.error('Unexpected error getting notification stats:', error);
    return {
      success: false,
      stats: null,
      error: 'Erro inesperado ao buscar estatísticas',
    };
  }
}

// ============================================================================
// CREATE NOTIFICATION (Admin/System only)
// ============================================================================

export async function createNotification(
  params: CreateNotificationRequest
): Promise<CreateNotificationResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        notification_id: null,
        error: 'Não autenticado',
      };
    }

    // Check if user is admin or above (security)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdminOrAbove = ['super_admin', 'admin', 'support'].includes(
      roleData?.role || ''
    );

    if (!isAdminOrAbove) {
      return {
        success: false,
        notification_id: null,
        error: 'Não autorizado',
      };
    }

    // Call SQL function
    const { data, error } = await supabase.rpc('create_notification_v2', {
      p_user_id: params.user_id,
      p_type: params.type,
      p_notification_type: params.notification_type,
      p_title: params.title,
      p_message: params.message,
      p_priority: params.priority || 'medium',
      p_action_url: params.action_url || null,
      p_metadata: params.metadata || {},
      p_respect_preferences: params.respect_preferences ?? true,
    });

    if (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        notification_id: null,
        error: 'Erro ao criar notificação',
      };
    }

    revalidatePath('/notifications');

    return {
      success: true,
      notification_id: data as string,
    };
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
    return {
      success: false,
      notification_id: null,
      error: 'Erro inesperado ao criar notificação',
    };
  }
}

// ============================================================================
// GET NOTIFICATION RULES (Admin only)
// ============================================================================

export async function getNotificationRules(): Promise<{
  success: boolean;
  rules: NotificationRule[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, rules: [], error: 'Não autenticado' };
    }

    // Check if user is admin or above (security)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdminOrAbove = ['super_admin', 'admin'].includes(
      roleData?.role || ''
    );

    if (!isAdminOrAbove) {
      return { success: false, rules: [], error: 'Não autorizado' };
    }

    // Get rules
    const { data, error } = await supabase
      .from('notification_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting notification rules:', error);
      return {
        success: false,
        rules: [],
        error: 'Erro ao buscar regras',
      };
    }

    return {
      success: true,
      rules: data as NotificationRule[],
    };
  } catch (error) {
    console.error('Unexpected error getting notification rules:', error);
    return {
      success: false,
      rules: [],
      error: 'Erro inesperado ao buscar regras',
    };
  }
}

// ============================================================================
// TOGGLE NOTIFICATION RULE (Super Admin only)
// ============================================================================

export async function toggleNotificationRule(
  ruleId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Não autenticado' };
    }

    // Check if user is super_admin (security)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'super_admin') {
      return { success: false, error: 'Não autorizado' };
    }

    // Update rule
    const { error } = await supabase
      .from('notification_rules')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', ruleId);

    if (error) {
      console.error('Error toggling notification rule:', error);
      return {
        success: false,
        error: 'Erro ao atualizar regra',
      };
    }

    revalidatePath('/admin/notification-rules');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error toggling notification rule:', error);
    return {
      success: false,
      error: 'Erro inesperado ao atualizar regra',
    };
  }
}
