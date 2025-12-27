# Phase 2B - Notification System

**Status:** ⏳ Planned  
**Priority:** High

## Overview

Comprehensive notification system with role-based rules, user preferences, and multi-channel delivery (in-app, email, push).

## Objectives

1. Expand existing notifications table
2. Create notification preferences system
3. Implement notification rules engine
4. Build notification UI components
5. Create super_admin configuration panel
6. Implement notification delivery system

## Notification Types by Role

### Super Admin Notifications

**Receives:**
- All admin actions (configurable)
- All support actions (configurable)
- Campaign approval requests
- Critical system alerts
- User reports/complaints
- Security alerts

**Configuration:**
- Can enable/disable specific admin action types
- Can set priority thresholds
- Can configure delivery channels per type

### Admin Notifications

**Receives:**
- Support user actions
- Provider activities (new services, issues)
- Client complaints/issues
- Bookings requiring attention
- System warnings

**Cannot Configure:**
- Receives all notifications (no custom preferences)
- Super_admin controls what admins receive

### Support Notifications

**Receives:**
- Provider support tickets
- Client support tickets
- Assigned bookings
- Escalated issues

**Limited Configuration:**
- Can set quiet hours
- Can choose delivery channels

### Provider Notifications

**Receives:**
- New bookings
- Booking updates/cancellations
- Client messages
- Review notifications
- Fixy campaigns/promotions
- Targeted offers

**Full Configuration:**
- Can enable/disable each type
- Can set delivery preferences
- Can set quiet hours

### Client Notifications

**Receives:**
- Booking confirmations
- Booking reminders
- Provider messages
- Service updates
- Fixy campaigns/promotions
- Targeted offers

**Full Configuration:**
- Can enable/disable each type
- Can set delivery preferences
- Can set quiet hours

## Database Schema

### Expand `notifications` Table

```sql
-- Add new columns to existing notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS notification_type TEXT NOT NULL DEFAULT 'system',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ;

-- Update type enum if it exists
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'booking_status',
  'promo',
  'follow',
  'system',
  'user_action',
  'campaign',
  'support_ticket',
  'review',
  'message',
  'security_alert'
));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
```

### New Table: `notification_preferences`

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'push'
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Indexes
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(notification_type);

-- RLS Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON notification_preferences
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all preferences"
  ON notification_preferences
  FOR SELECT
  USING (is_admin_or_above());
```

### New Table: `notification_rules`

```sql
CREATE TABLE notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  source_role TEXT NOT NULL, -- Role that triggers the notification
  target_role TEXT NOT NULL, -- Role that receives the notification
  event_type TEXT NOT NULL, -- Type of event that triggers
  notification_type TEXT NOT NULL, -- Type of notification to send
  priority TEXT DEFAULT 'medium',
  auto_notify BOOLEAN DEFAULT true,
  enabled BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '{}', -- Additional conditions
  template_title TEXT,
  template_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_rules_source_role ON notification_rules(source_role);
CREATE INDEX idx_notification_rules_target_role ON notification_rules(target_role);
CREATE INDEX idx_notification_rules_event_type ON notification_rules(event_type);
CREATE INDEX idx_notification_rules_enabled ON notification_rules(enabled);

-- RLS Policies
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage rules"
  ON notification_rules
  FOR ALL
  USING (is_super_admin());

CREATE POLICY "Admins can view rules"
  ON notification_rules
  FOR SELECT
  USING (is_admin_or_above());
```

### New Table: `notification_delivery_log`

```sql
CREATE TABLE notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'in_app', 'email', 'push'
  status TEXT NOT NULL, -- 'pending', 'sent', 'failed', 'bounced'
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX idx_notification_delivery_log_channel ON notification_delivery_log(channel);
CREATE INDEX idx_notification_delivery_log_status ON notification_delivery_log(status);

-- RLS Policies
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view delivery logs"
  ON notification_delivery_log
  FOR SELECT
  USING (is_admin_or_above());
```

## Database Functions

### `create_notification()`

```sql
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_preferences RECORD;
  v_in_quiet_hours BOOLEAN := false;
BEGIN
  -- Check user preferences
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id
    AND notification_type = p_notification_type;
  
  -- If preferences exist and disabled, don't create notification
  IF FOUND AND NOT v_preferences.enabled THEN
    RETURN NULL;
  END IF;
  
  -- Check quiet hours
  IF v_preferences.quiet_hours_start IS NOT NULL 
     AND v_preferences.quiet_hours_end IS NOT NULL THEN
    v_in_quiet_hours := CURRENT_TIME BETWEEN 
      v_preferences.quiet_hours_start AND v_preferences.quiet_hours_end;
  END IF;
  
  -- Create notification (even during quiet hours, just don't send immediately)
  INSERT INTO notifications (
    user_id,
    type,
    notification_type,
    title,
    message,
    priority,
    action_url,
    data
  ) VALUES (
    p_user_id,
    p_type,
    p_notification_type,
    p_title,
    p_message,
    p_priority,
    p_action_url,
    p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  -- Schedule delivery based on channels and quiet hours
  IF NOT v_in_quiet_hours THEN
    PERFORM schedule_notification_delivery(v_notification_id, v_preferences.channels);
  END IF;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `schedule_notification_delivery()`

```sql
CREATE OR REPLACE FUNCTION schedule_notification_delivery(
  p_notification_id UUID,
  p_channels TEXT[]
)
RETURNS VOID AS $$
DECLARE
  v_channel TEXT;
BEGIN
  FOREACH v_channel IN ARRAY p_channels
  LOOP
    INSERT INTO notification_delivery_log (
      notification_id,
      channel,
      status
    ) VALUES (
      p_notification_id,
      v_channel,
      'pending'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `get_unread_notification_count()`

```sql
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id
      AND read_at IS NULL
      AND dismissed_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `mark_notification_read()`

```sql
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid()
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `mark_all_notifications_read()`

```sql
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE user_id = p_user_id
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Notification Rules Engine

### Default Rules

#### Rule 1: Admin Creates Support → Notify Super Admins

```json
{
  "name": "Admin Creates Support User",
  "source_role": "admin",
  "target_role": "super_admin",
  "event_type": "create_user",
  "notification_type": "user_action",
  "priority": "medium",
  "auto_notify": true,
  "conditions": {
    "target_user_role": "support"
  },
  "template_title": "New Support User Created",
  "template_message": "Admin {{admin_name}} created a new support user: {{user_email}}"
}
```

#### Rule 2: Support Action → Notify Admins

```json
{
  "name": "Support User Action",
  "source_role": "support",
  "target_role": "admin",
  "event_type": "important_action",
  "notification_type": "user_action",
  "priority": "medium",
  "auto_notify": true
}
```

#### Rule 3: Provider Issue → Notify Admins

```json
{
  "name": "Provider Needs Attention",
  "source_role": "provider",
  "target_role": "admin",
  "event_type": "issue_reported",
  "notification_type": "support_ticket",
  "priority": "high",
  "auto_notify": true
}
```

#### Rule 4: Client Complaint → Notify Admins & Support

```json
{
  "name": "Client Complaint",
  "source_role": "client",
  "target_role": "admin,support",
  "event_type": "complaint",
  "notification_type": "support_ticket",
  "priority": "high",
  "auto_notify": true
}
```

## UI Components

### 1. Notification Bell (Header)

**Location:** Dashboard header  
**Features:**
- Badge with unread count
- Dropdown with recent notifications
- "Mark all as read" button
- "View all" link to full page
- Real-time updates (polling or websocket)

**Component:** `src/components/notifications/NotificationBell.tsx`

```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  action_url?: string;
  read_at?: string;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch notifications
  // Mark as read
  // Navigate to action URL
  
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <BellIcon />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
        />
      )}
    </div>
  );
}
```

### 2. Notifications Page

**Route:** `/notifications`  
**Features:**
- Full list of all notifications
- Filter by type, priority, read/unread
- Search notifications
- Bulk actions (mark as read, delete)
- Pagination
- Notification details modal

### 3. Notification Preferences Page

**Route:** `/settings/notifications`  
**Features:**
- Toggle each notification type
- Select delivery channels (in-app, email, push)
- Set quiet hours
- Test notification button
- Save preferences

**Permissions:**
- Providers and clients: Full access
- Support: Limited access (quiet hours only)
- Admins: View only (cannot change)
- Super admins: Full access

### 4. Notification Rules Management (Super Admin Only)

**Route:** `/admin/notification-rules`  
**Features:**
- List all notification rules
- Create new rules
- Edit existing rules
- Enable/disable rules
- Test rules
- View rule execution logs

**Rule Form Fields:**
- Name
- Description
- Source role (who triggers)
- Target role (who receives)
- Event type
- Notification type
- Priority
- Auto-notify toggle
- Conditions (JSON editor)
- Template title
- Template message

## Notification Delivery

### In-App Delivery

- Stored in `notifications` table
- Displayed in UI immediately
- Real-time updates via polling (every 30s) or WebSocket

### Email Delivery

**Options:**
1. Supabase Auth emails (limited)
2. SendGrid integration
3. Resend integration
4. AWS SES

**Email Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
  <h1>{{title}}</h1>
  <p>{{message}}</p>
  <a href="{{action_url}}">View Details</a>
</body>
</html>
```

### Push Notifications

**Options:**
1. Firebase Cloud Messaging (FCM)
2. OneSignal
3. Pusher

**Implementation:** Phase 3 (Future)

## Super Admin Configuration Panel

### Notification Settings Page

**Route:** `/admin/settings/notifications`

**Sections:**

#### 1. Admin Notification Controls

Configure what notifications admins receive:

- [ ] Support user actions
- [ ] Provider new services
- [ ] Provider issues
- [ ] Client complaints
- [ ] Booking issues
- [ ] System warnings

#### 2. Support Notification Controls

Configure what notifications support receives:

- [ ] Provider tickets
- [ ] Client tickets
- [ ] Escalated issues
- [ ] Assigned bookings

#### 3. Notification Rules

- View all active rules
- Enable/disable rules
- Edit rule priorities
- Create custom rules

#### 4. Delivery Settings

- Email service configuration
- Push notification settings
- Rate limiting
- Batch sending options

## Implementation Checklist

### Database
- [ ] Expand `notifications` table
- [ ] Create `notification_preferences` table
- [ ] Create `notification_rules` table
- [ ] Create `notification_delivery_log` table
- [ ] Create notification functions
- [ ] Add RLS policies
- [ ] Create indexes
- [ ] Insert default rules

### Server Actions
- [ ] `getNotifications()` - Get user notifications
- [ ] `getUnreadCount()` - Get unread count
- [ ] `markAsRead()` - Mark notification as read
- [ ] `markAllAsRead()` - Mark all as read
- [ ] `dismissNotification()` - Dismiss notification
- [ ] `getPreferences()` - Get user preferences
- [ ] `updatePreferences()` - Update preferences
- [ ] `createNotificationRule()` - Create rule (super_admin)
- [ ] `updateNotificationRule()` - Update rule (super_admin)
- [ ] `deleteNotificationRule()` - Delete rule (super_admin)

### Components
- [ ] NotificationBell - Header notification bell
- [ ] NotificationDropdown - Dropdown menu
- [ ] NotificationList - Full list page
- [ ] NotificationItem - Single notification
- [ ] NotificationPreferences - Preferences form
- [ ] NotificationRuleForm - Rule creation/edit
- [ ] NotificationRuleList - Rules management

### Pages
- [ ] `/notifications` - All notifications
- [ ] `/settings/notifications` - User preferences
- [ ] `/admin/notification-rules` - Rules management (super_admin)
- [ ] `/admin/settings/notifications` - Admin controls (super_admin)

### Testing
- [ ] Test notification creation
- [ ] Test preference filtering
- [ ] Test quiet hours
- [ ] Test rule engine
- [ ] Test delivery logging
- [ ] Test real-time updates

## Performance Considerations

### Optimization Strategies

1. **Pagination:** Load notifications in batches (20-50 per page)
2. **Indexing:** Proper indexes on frequently queried columns
3. **Caching:** Cache unread count for 30 seconds
4. **Batch Processing:** Send email notifications in batches
5. **Archiving:** Archive old notifications after 90 days

### Real-Time Updates

**Option 1: Polling (Simple)**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchUnreadCount();
  }, 30000); // Every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

**Option 2: Supabase Realtime (Better)**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      // Update UI with new notification
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [userId]);
```

## Security Considerations

1. **RLS Policies:** Users can only see their own notifications
2. **Rule Validation:** Only super_admins can create/edit rules
3. **Preference Validation:** Users can only edit their own preferences
4. **Rate Limiting:** Prevent notification spam
5. **Content Sanitization:** Sanitize notification content to prevent XSS

## Next Steps

After Phase 2B completion:
- Phase 2C - Campaign and promotion system
- Phase 3 - Push notification implementation
- Phase 4 - Advanced analytics and reporting

## References

- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [SendGrid API](https://docs.sendgrid.com/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
