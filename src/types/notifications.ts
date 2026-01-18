/**
 * Notification System Types
 * Phase 2.7 - Enhanced notification system with preferences and rules
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Notification delivery channels
 */
export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
}

/**
 * Notification delivery status
 */
export enum NotificationDeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  DELIVERED = 'delivered',
}

/**
 * Legacy notification types (from existing enum)
 */
export enum NotificationType {
  BOOKING_STATUS = 'booking_status',
  PROMO = 'promo',
  FOLLOW = 'follow',
  SYSTEM = 'system',
}

/**
 * Specific notification types (more granular)
 */
export enum SpecificNotificationType {
  USER_ACTION = 'user_action',
  BOOKING_UPDATE = 'booking_update',
  BOOKING_ATTENTION = 'booking_attention',
  CAMPAIGN = 'campaign',
  SUPPORT_TICKET = 'support_ticket',
  REVIEW = 'review',
  MESSAGE = 'message',
  SECURITY_ALERT = 'security_alert',
}

/**
 * User roles for notification rules
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SUPPORT = 'support',
  PROVIDER = 'provider',
  CLIENT = 'client',
  SYSTEM = 'system',
}

/**
 * Event types for notification rules
 */
export enum NotificationEventType {
  CREATE_USER = 'create_user',
  IMPORTANT_ACTION = 'important_action',
  ISSUE_REPORTED = 'issue_reported',
  COMPLAINT = 'complaint',
  BOOKING_ATTENTION = 'booking_attention',
}

// ============================================================================
// INTERFACES - CORE ENTITIES
// ============================================================================

/**
 * Notification entity (from database)
 */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  notification_type: string | null;
  title: string;
  message: string;
  data: Record<string, any> | null;
  metadata: Record<string, any>;
  priority: NotificationPriority;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  clicked_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}

/**
 * Notification with user details (from view)
 */
export interface NotificationWithDetails extends Notification {
  user_name: string | null;
  user_avatar: string | null;
  user_email: string | null;
  delivery_status: NotificationDeliveryLog[] | null;
}

/**
 * Notification preference entity
 */
export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  enabled: boolean;
  channels: NotificationChannel[];
  quiet_hours_start: string | null; // TIME format "HH:MM:SS"
  quiet_hours_end: string | null; // TIME format "HH:MM:SS"
  created_at: string;
  updated_at: string;
}

/**
 * Notification rule entity
 */
export interface NotificationRule {
  id: string;
  name: string;
  description: string | null;
  source_role: UserRole;
  target_role: string; // Can be comma-separated roles
  event_type: NotificationEventType;
  notification_type: string;
  priority: NotificationPriority;
  auto_notify: boolean;
  enabled: boolean;
  conditions: Record<string, any>;
  template_title: string | null;
  template_message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Notification delivery log entity
 */
export interface NotificationDeliveryLog {
  id: string;
  notification_id: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

// ============================================================================
// INTERFACES - REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request to create a notification
 */
export interface CreateNotificationRequest {
  user_id: string;
  type: NotificationType;
  notification_type: string;
  title: string;
  message: string;
  priority?: NotificationPriority;
  action_url?: string;
  metadata?: Record<string, any>;
  respect_preferences?: boolean;
}

/**
 * Response from creating a notification
 */
export interface CreateNotificationResponse {
  success: boolean;
  notification_id: string | null;
  error?: string;
}

/**
 * Request to get notifications
 */
export interface GetNotificationsRequest {
  user_id: string;
  unread_only?: boolean;
  priority?: NotificationPriority;
  notification_type?: string;
  limit?: number;
  offset?: number;
}

/**
 * Response from getting notifications
 */
export interface GetNotificationsResponse {
  success: boolean;
  notifications: Notification[];
  total?: number;
  error?: string;
}

/**
 * Request to mark notification as read
 */
export interface MarkNotificationReadRequest {
  notification_id: string;
  user_id: string;
  clicked?: boolean;
}

/**
 * Response from marking notification as read
 */
export interface MarkNotificationReadResponse {
  success: boolean;
  error?: string;
}

/**
 * Request to dismiss notification
 */
export interface DismissNotificationRequest {
  notification_id: string;
  user_id: string;
}

/**
 * Response from dismissing notification
 */
export interface DismissNotificationResponse {
  success: boolean;
  error?: string;
}

/**
 * Request to get unread count
 */
export interface GetUnreadCountRequest {
  user_id: string;
  priority?: NotificationPriority;
}

/**
 * Response from getting unread count
 */
export interface GetUnreadCountResponse {
  success: boolean;
  count: number;
  error?: string;
}

/**
 * Request to mark all as read
 */
export interface MarkAllReadRequest {
  user_id: string;
  notification_type?: string;
}

/**
 * Response from marking all as read
 */
export interface MarkAllReadResponse {
  success: boolean;
  count: number;
  error?: string;
}

/**
 * Request to update notification preference
 */
export interface UpdateNotificationPreferenceRequest {
  user_id: string;
  notification_type: string;
  enabled?: boolean;
  channels?: NotificationChannel[];
  quiet_hours_start?: string; // TIME format "HH:MM:SS"
  quiet_hours_end?: string; // TIME format "HH:MM:SS"
}

/**
 * Response from updating notification preference
 */
export interface UpdateNotificationPreferenceResponse {
  success: boolean;
  error?: string;
}

/**
 * Request to get user preferences
 */
export interface GetUserPreferencesRequest {
  user_id: string;
}

/**
 * Response from getting user preferences
 */
export interface GetUserPreferencesResponse {
  success: boolean;
  preferences: NotificationPreference[];
  error?: string;
}

/**
 * Request to apply notification rule
 */
export interface ApplyNotificationRuleRequest {
  rule_id: string;
  variables?: Record<string, any>;
}

/**
 * Response from applying notification rule
 */
export interface ApplyNotificationRuleResponse {
  success: boolean;
  count: number;
  error?: string;
}

/**
 * Request to find and apply notification rules
 */
export interface FindAndApplyRulesRequest {
  source_role: UserRole;
  event_type: NotificationEventType;
  variables?: Record<string, any>;
}

/**
 * Response from finding and applying rules
 */
export interface FindAndApplyRulesResponse {
  success: boolean;
  count: number;
  error?: string;
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  dismissed: number;
  by_priority: Record<NotificationPriority, number>;
  by_type: Record<string, number>;
}

/**
 * Response from getting notification stats
 */
export interface GetNotificationStatsResponse {
  success: boolean;
  stats: NotificationStats | null;
  error?: string;
}

// ============================================================================
// INTERFACES - UI COMPONENTS
// ============================================================================

/**
 * Props for NotificationBadge component
 */
export interface NotificationBadgeProps {
  count: number;
  priority?: NotificationPriority;
  className?: string;
}

/**
 * Props for NotificationItem component
 */
export interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  onClick?: (id: string) => void;
  onDismiss?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

/**
 * Props for NotificationList component
 */
export interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onRead?: (id: string) => void;
  onClick?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Props for NotificationFilters component
 */
export interface NotificationFiltersProps {
  priority?: NotificationPriority;
  notificationType?: string;
  unreadOnly?: boolean;
  onPriorityChange?: (priority: NotificationPriority | undefined) => void;
  onTypeChange?: (type: string | undefined) => void;
  onUnreadOnlyChange?: (unreadOnly: boolean) => void;
  className?: string;
}

/**
 * Props for NotificationPreferences component
 */
export interface NotificationPreferencesProps {
  userId: string;
  preferences: NotificationPreference[];
  onUpdate?: (preference: NotificationPreference) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Props for PreferenceToggle component
 */
export interface PreferenceToggleProps {
  preference: NotificationPreference;
  onToggle?: (notificationType: string, enabled: boolean) => void;
  onChannelsChange?: (notificationType: string, channels: NotificationChannel[]) => void;
  onQuietHoursChange?: (
    notificationType: string,
    start: string | null,
    end: string | null
  ) => void;
  className?: string;
}

/**
 * Props for NotificationRuleForm component
 */
export interface NotificationRuleFormProps {
  rule?: NotificationRule;
  onSubmit?: (rule: Partial<NotificationRule>) => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * Props for NotificationRuleList component
 */
export interface NotificationRuleListProps {
  rules: NotificationRule[];
  onEdit?: (rule: NotificationRule) => void;
  onDelete?: (ruleId: string) => void;
  onToggle?: (ruleId: string, enabled: boolean) => void;
  loading?: boolean;
  className?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Notification filter options
 */
export interface NotificationFilters {
  unread_only?: boolean;
  priority?: NotificationPriority;
  notification_type?: string;
}

/**
 * Notification sort options
 */
export enum NotificationSortBy {
  CREATED_AT_DESC = 'created_at_desc',
  CREATED_AT_ASC = 'created_at_asc',
  PRIORITY_DESC = 'priority_desc',
  PRIORITY_ASC = 'priority_asc',
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit: number;
  offset: number;
}

/**
 * Notification context (for React Context)
 */
export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid NotificationPriority
 */
export function isNotificationPriority(value: any): value is NotificationPriority {
  return Object.values(NotificationPriority).includes(value);
}

/**
 * Check if value is a valid NotificationChannel
 */
export function isNotificationChannel(value: any): value is NotificationChannel {
  return Object.values(NotificationChannel).includes(value);
}

/**
 * Check if value is a valid NotificationType
 */
export function isNotificationType(value: any): value is NotificationType {
  return Object.values(NotificationType).includes(value);
}

/**
 * Check if notification is unread
 */
export function isUnread(notification: Notification): boolean {
  return notification.read_at === null;
}

/**
 * Check if notification is dismissed
 */
export function isDismissed(notification: Notification): boolean {
  return notification.dismissed_at !== null;
}

/**
 * Check if notification is clicked
 */
export function isClicked(notification: Notification): boolean {
  return notification.clicked_at !== null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get priority color class
 */
export function getPriorityColor(priority: NotificationPriority): string {
  switch (priority) {
    case NotificationPriority.LOW:
      return 'text-gray-500 dark:text-gray-400';
    case NotificationPriority.MEDIUM:
      return 'text-blue-500 dark:text-blue-400';
    case NotificationPriority.HIGH:
      return 'text-orange-500 dark:text-orange-400';
    case NotificationPriority.URGENT:
      return 'text-red-500 dark:text-red-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
}

/**
 * Get priority badge class
 */
export function getPriorityBadgeClass(priority: NotificationPriority): string {
  switch (priority) {
    case NotificationPriority.LOW:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    case NotificationPriority.MEDIUM:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case NotificationPriority.HIGH:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case NotificationPriority.URGENT:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}

/**
 * Format time ago
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'agora';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h atrás`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} dias atrás`;
  
  return date.toLocaleDateString('pt-BR');
}

/**
 * Get channel icon name
 */
export function getChannelIcon(channel: NotificationChannel): string {
  switch (channel) {
    case NotificationChannel.IN_APP:
      return 'bell';
    case NotificationChannel.EMAIL:
      return 'mail';
    case NotificationChannel.PUSH:
      return 'smartphone';
    default:
      return 'bell';
  }
}

/**
 * Get channel label
 */
export function getChannelLabel(channel: NotificationChannel): string {
  switch (channel) {
    case NotificationChannel.IN_APP:
      return 'In-App';
    case NotificationChannel.EMAIL:
      return 'Email';
    case NotificationChannel.PUSH:
      return 'Push';
    default:
      return channel;
  }
}
