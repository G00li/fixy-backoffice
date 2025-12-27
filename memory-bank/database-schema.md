# Database Schema - Fixy Backoffice

**Last Updated:** 2025-12-26  
**Database:** PostgreSQL (Supabase)

## Overview

Complete database schema for the Fixy platform, including user management, RBAC, notifications, campaigns, and core business entities.

## Entity Relationship Diagram

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
user_roles (1:1) → RBAC System
    ↓
├── bookings (1:N)
├── services (1:N) [if provider]
├── reviews (1:N)
├── notifications (1:N)
├── campaign_notifications (1:N)
└── admin_actions_log (1:N) [if admin]
```

## Core Tables

### `profiles`

User profile information (extends Supabase Auth users)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  
  -- Location
  location GEOGRAPHY(POINT),
  location_text TEXT,
  address JSONB,
  postal_code TEXT,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  
  -- Subscription (Future)
  current_plan_id UUID REFERENCES plans(id),
  plan_started_at TIMESTAMPTZ,
  plan_expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `profiles_pkey` on `id`
- `idx_profiles_email` on `email`
- `idx_profiles_location` on `location` (GiST)

**RLS Policies:**
- Users can view own profile
- Support and above can view all profiles
- Admins and above can update any profile
- Super admins can delete profiles

### `user_roles`

Role-based access control

```sql
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support', 'provider', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `user_roles_pkey` on `user_id`
- `idx_user_roles_role` on `role`

**RLS Policies:**
- Users can view own role
- Super admins can manage all roles
- Admins can manage non-super-admin roles

## Business Tables

### `categories`

Service categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `services`

Services offered by providers

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_min INTEGER NOT NULL,
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_services_provider_id` on `provider_id`
- `idx_services_category_id` on `category_id`
- `idx_services_is_active` on `is_active`

### `bookings`

Service bookings

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_bookings_client_id` on `client_id`
- `idx_bookings_provider_id` on `provider_id`
- `idx_bookings_status` on `status`
- `idx_bookings_start_time` on `start_time`

### `reviews`

Service reviews

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_reviews_provider_id` on `provider_id`
- `idx_reviews_rating` on `rating`

## Admin & Audit Tables

### `admin_actions_log`

Audit trail for administrative actions

```sql
CREATE TABLE admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_role TEXT,
  previous_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_admin_actions_log_admin_id` on `admin_id`
- `idx_admin_actions_log_target_user_id` on `target_user_id`
- `idx_admin_actions_log_action_type` on `action_type`
- `idx_admin_actions_log_created_at` on `created_at DESC`

## Notification Tables

### `notifications`

User notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  action_url TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_notifications_user_id` on `user_id`
- `idx_notifications_user_id_read` on `(user_id, read_at)`
- `idx_notifications_type` on `notification_type`
- `idx_notifications_priority` on `priority`
- `idx_notifications_created_at` on `created_at DESC`

### `notification_preferences`

User notification preferences

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  channels TEXT[] DEFAULT ARRAY['in_app'],
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);
```

### `notification_rules`

Notification automation rules

```sql
CREATE TABLE notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  source_role TEXT NOT NULL,
  target_role TEXT NOT NULL,
  event_type TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  auto_notify BOOLEAN DEFAULT true,
  enabled BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '{}',
  template_title TEXT,
  template_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Campaign Tables

### `campaigns`

Marketing campaigns and promotions

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('global', 'segmented', 'individual')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'providers', 'clients', 'specific')),
  target_user_ids UUID[],
  
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_service')),
  discount_value NUMERIC,
  discount_code TEXT UNIQUE,
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'active', 'paused', 'expired', 'cancelled')),
  
  banner_url TEXT,
  thumbnail_url TEXT,
  
  created_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_campaigns_status` on `status`
- `idx_campaigns_campaign_type` on `campaign_type`
- `idx_campaigns_target_audience` on `target_audience`
- `idx_campaigns_created_by` on `created_by`
- `idx_campaigns_start_date` on `start_date`
- `idx_campaigns_end_date` on `end_date`
- `idx_campaigns_discount_code` on `discount_code` (WHERE discount_code IS NOT NULL)

### `campaign_notifications`

Campaign notification tracking

```sql
CREATE TABLE campaign_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  UNIQUE(campaign_id, user_id)
);
```

### `campaign_usage`

Campaign usage tracking

```sql
CREATE TABLE campaign_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  discount_applied NUMERIC NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Views

### `users_with_roles`

Convenient view joining profiles with roles

```sql
CREATE VIEW users_with_roles AS
SELECT 
  p.*,
  ur.role,
  ur.created_at as role_assigned_at
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id;
```

## Functions

### RBAC Functions

- `is_super_admin(user_id UUID)` → BOOLEAN
- `is_admin(user_id UUID)` → BOOLEAN
- `is_admin_or_above(user_id UUID)` → BOOLEAN
- `is_support_or_above(user_id UUID)` → BOOLEAN
- `is_provider(user_id UUID)` → BOOLEAN
- `is_client(user_id UUID)` → BOOLEAN
- `get_user_role(user_id UUID)` → TEXT
- `has_role(user_id UUID, allowed_roles TEXT[])` → BOOLEAN

### Admin Functions

- `log_admin_action(...)` → UUID
- `notify_super_admins(...)` → VOID
- `create_user_with_role(...)` → JSONB

### Notification Functions

- `create_notification(...)` → UUID
- `schedule_notification_delivery(...)` → VOID
- `get_unread_notification_count(user_id UUID)` → INTEGER
- `mark_notification_read(notification_id UUID)` → VOID
- `mark_all_notifications_read(user_id UUID)` → VOID

### Campaign Functions

- `create_campaign(...)` → JSONB
- `approve_campaign(...)` → JSONB
- `reject_campaign(...)` → JSONB
- `activate_campaign(campaign_id UUID)` → JSONB
- `validate_campaign_code(...)` → JSONB

## Triggers

### `update_updated_at`

Automatically updates `updated_at` timestamp on UPDATE

Applied to tables:
- profiles
- user_roles
- services
- bookings
- notification_preferences
- notification_rules
- campaigns

### `on_auth_user_created`

Automatically assigns `client` role to new users

## Enums

### `user_role`
- `super_admin`
- `admin`
- `support`
- `provider`
- `client`

### `booking_status`
- `pending`
- `confirmed`
- `cancelled`
- `completed`

### `notification_type`
- `booking_status`
- `promo`
- `follow`
- `system`
- `user_action`
- `campaign`
- `support_ticket`
- `review`
- `message`
- `security_alert`

### `subscription_status` (Future)
- `active`
- `past_due`
- `canceled`
- `trialing`

## Indexes Summary

Total indexes: 50+

**Most Important:**
- User lookups: `profiles.id`, `user_roles.user_id`
- Role checks: `user_roles.role`
- Bookings: `bookings.provider_id`, `bookings.client_id`, `bookings.status`
- Notifications: `notifications.user_id`, `notifications.read_at`
- Campaigns: `campaigns.status`, `campaigns.discount_code`

## RLS Policies Summary

All tables have Row Level Security enabled.

**Policy Types:**
1. **Self-access:** Users can view/edit own data
2. **Role-based:** Admins/Support can view more data
3. **Hierarchical:** Super admins have full access

## Storage Buckets

### `avatars`
- User profile pictures
- Public read access
- Authenticated write access

### `service-images`
- Service photos
- Public read access
- Provider write access

### `campaign-banners`
- Campaign promotional images
- Public read access
- Admin write access

## Migration History

See `fixy-supabase/supabase/migrations/README.md` for complete migration history.

**Total Migrations:** 9 (as of 2025-12-26)

## Performance Considerations

### Query Optimization

1. **Use indexes:** All foreign keys and frequently queried columns are indexed
2. **Limit results:** Always use pagination for large datasets
3. **Select specific columns:** Avoid `SELECT *` in production
4. **Use views:** `users_with_roles` for common joins

### Scaling Strategies

1. **Partitioning:** Consider partitioning large tables (bookings, notifications) by date
2. **Archiving:** Archive old data (notifications > 90 days, completed bookings > 1 year)
3. **Caching:** Cache frequently accessed data (user roles, categories)
4. **Read replicas:** Use Supabase read replicas for analytics queries

## Backup Strategy

1. **Automated backups:** Supabase provides daily backups
2. **Point-in-time recovery:** Available for Pro plan and above
3. **Manual exports:** Regular exports of critical data
4. **Migration files:** Version controlled in Git

## Security Best Practices

1. **RLS enabled:** All tables have RLS policies
2. **Service role protection:** Never expose service role key to client
3. **Input validation:** Validate all inputs before database operations
4. **Audit logging:** Log all administrative actions
5. **Regular reviews:** Review and update RLS policies regularly

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [PostGIS](https://postgis.net/documentation/) (for location features)
