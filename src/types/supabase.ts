export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_actions_log: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          previous_data: Json | null
          target_role: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          previous_data?: Json | null
          target_role?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          previous_data?: Json | null
          target_role?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      pending_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          recipient_id: string
          scheduled_for: string | null
          sent_at: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          recipient_id: string
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          recipient_id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          bio: string | null
          username: string | null
          postal_code: string | null
          location_text: string | null
          address: Json | null
          password_is_temporary: boolean | null
          password_expires_at: string | null
          password_changed_at: string | null
          cover_image_url: string | null
          business_name: string | null
          display_name: string | null
          social_media: Json | null
          is_verified: boolean | null
          verified_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          username?: string | null
          postal_code?: string | null
          location_text?: string | null
          address?: Json | null
          password_is_temporary?: boolean | null
          password_expires_at?: string | null
          password_changed_at?: string | null
          cover_image_url?: string | null
          business_name?: string | null
          display_name?: string | null
          social_media?: Json | null
          is_verified?: boolean | null
          verified_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          username?: string | null
          postal_code?: string | null
          location_text?: string | null
          address?: Json | null
          password_is_temporary?: boolean | null
          password_expires_at?: string | null
          password_changed_at?: string | null
          cover_image_url?: string | null
          business_name?: string | null
          display_name?: string | null
          social_media?: Json | null
          is_verified?: boolean | null
          verified_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          user_id: string
          role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          role: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          role?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      users_with_roles: {
        Row: {
          id: string | null
          email: string | null
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          bio: string | null
          username: string | null
          postal_code: string | null
          location_text: string | null
          address: Json | null
          password_is_temporary: boolean | null
          password_expires_at: string | null
          password_changed_at: string | null
          cover_image_url: string | null
          business_name: string | null
          display_name: string | null
          social_media: Json | null
          is_verified: boolean | null
          verified_at: string | null
          role: string | null
          role_assigned_at: string | null
          created_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_admin_or_above: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_support_or_above: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_provider: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_client: {
        Args: { user_id?: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_role: {
        Args: { user_id: string; required_role: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_admin_id: string
          p_action_type: string
          p_target_user_id?: string
          p_target_role?: string
          p_previous_data?: Json
          p_new_data?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      notify_super_admins: {
        Args: {
          p_title: string
          p_message: string
          p_notification_type: string
          p_data?: Json
          p_priority?: string
        }
        Returns: undefined
      }
      notify_user: {
        Args: {
          p_recipient_id: string
          p_title: string
          p_message: string
          p_notification_type: string
          p_data?: Json
          p_priority?: string
          p_scheduled_for?: string
        }
        Returns: string
      }
      get_user_notifications: {
        Args: {
          p_user_id: string
          p_limit?: number
          p_offset?: number
          p_unread_only?: boolean
        }
        Returns: {
          id: string
          title: string
          message: string
          notification_type: string
          data: Json
          priority: string
          scheduled_for: string
          sent_at: string
          read_at: string
          created_at: string
        }[]
      }
      mark_notification_as_read: {
        Args: {
          p_notification_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      can_create_role: {
        Args: {
          p_creator_id: string
          p_target_role: string
        }
        Returns: boolean
      }
      can_manage_user: {
        Args: {
          p_manager_id: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      has_expired_password: {
        Args: { user_id: string }
        Returns: boolean
      }
      mark_password_changed: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
