# Phase 2A - User Management System

**Status:** ⏳ Planned  
**Priority:** High

## Overview

Complete user management system with role-based permissions, audit logging, and temporary super admin creation route.

## Objectives

1. Create temporary route for initial super_admin setup
2. Implement user listing with filters and search
3. Create user creation with role validation
4. Implement user editing and role management
5. Add audit logging for all admin actions
6. Notification system when admin creates support users

## Database Schema

### New Tables

#### 1. `admin_actions_log`

**Purpose:** Audit trail for all administrative actions

```sql
CREATE TABLE admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'create_user', 'update_role', 'delete_user', 'update_profile', etc.
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_role TEXT, -- Role of the target user
  previous_data JSONB, -- Previous state (for updates)
  new_data JSONB, -- New state
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_actions_log_admin_id ON admin_actions_log(admin_id);
CREATE INDEX idx_admin_actions_log_target_user_id ON admin_actions_log(target_user_id);
CREATE INDEX idx_admin_actions_log_action_type ON admin_actions_log(action_type);
CREATE INDEX idx_admin_actions_log_created_at ON admin_actions_log(created_at DESC);

-- RLS Policies
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;

-- Super admins can view all logs
CREATE POLICY "Super admins can view all logs"
  ON admin_actions_log
  FOR SELECT
  USING (is_super_admin());

-- Admins can view their own logs and logs of non-super-admins
CREATE POLICY "Admins can view relevant logs"
  ON admin_actions_log
  FOR SELECT
  USING (
    is_admin_or_above() AND (
      admin_id = auth.uid() OR
      target_user_id IN (
        SELECT user_id FROM user_roles 
        WHERE role NOT IN ('super_admin')
      )
    )
  );
```

#### 2. `pending_notifications`

**Purpose:** Queue for notifications that need to be sent

```sql
CREATE TABLE pending_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pending_notifications_recipient_id ON pending_notifications(recipient_id);
CREATE INDEX idx_pending_notifications_sent_at ON pending_notifications(sent_at);
CREATE INDEX idx_pending_notifications_scheduled_for ON pending_notifications(scheduled_for);

-- RLS Policies
ALTER TABLE pending_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending notifications"
  ON pending_notifications
  FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Admins can manage notifications"
  ON pending_notifications
  FOR ALL
  USING (is_admin_or_above());
```

### Database Functions

#### `log_admin_action()`

```sql
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action_type TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_target_role TEXT DEFAULT NULL,
  p_previous_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_actions_log (
    admin_id,
    action_type,
    target_user_id,
    target_role,
    previous_data,
    new_data,
    ip_address,
    user_agent
  ) VALUES (
    p_admin_id,
    p_action_type,
    p_target_user_id,
    p_target_role,
    p_previous_data,
    p_new_data,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `notify_super_admins()`

```sql
CREATE OR REPLACE FUNCTION notify_super_admins(
  p_title TEXT,
  p_message TEXT,
  p_notification_type TEXT,
  p_data JSONB DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO pending_notifications (
    recipient_id,
    notification_type,
    title,
    message,
    data,
    priority
  )
  SELECT 
    user_id,
    p_notification_type,
    p_title,
    p_message,
    p_data,
    p_priority
  FROM user_roles
  WHERE role = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `create_user_with_role()`

```sql
CREATE OR REPLACE FUNCTION create_user_with_role(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_created_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_creator_role TEXT;
  v_result JSONB;
BEGIN
  -- Get creator's role
  SELECT role INTO v_creator_role
  FROM user_roles
  WHERE user_id = p_created_by;
  
  -- Validate permissions
  IF v_creator_role = 'super_admin' THEN
    -- Super admin can create: admin, support, provider
    IF p_role NOT IN ('admin', 'support', 'provider') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Super admins can only create admin, support, or provider accounts'
      );
    END IF;
  ELSIF v_creator_role = 'admin' THEN
    -- Admin can only create: support
    IF p_role != 'support' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Admins can only create support accounts'
      );
    END IF;
    
    -- Notify super admins when admin creates support
    PERFORM notify_super_admins(
      'New Support User Created',
      format('Admin %s created a new support user: %s', p_created_by, p_email),
      'user_created',
      jsonb_build_object(
        'created_by', p_created_by,
        'new_user_email', p_email,
        'role', p_role
      ),
      'medium'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient permissions to create users'
    );
  END IF;
  
  -- Create user in auth.users (this would be done via Supabase Admin API in practice)
  -- For now, return success with instructions
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User creation validated. Proceed with Supabase Admin API.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Temporary Super Admin Setup Route

### Route: `/setup-super-admin`

**Purpose:** One-time route to create the first super_admin

**Security:**
- Protected by secret token in environment variable
- Should be deleted after first super_admin is created
- Logs creation for audit trail

**Environment Variable:**
```env
SUPER_ADMIN_SETUP_TOKEN=your-secret-token-here-change-this
```

**Implementation:**

```typescript
// src/app/setup-super-admin/page.tsx
'use client';

import { useState } from 'react';
import { createSuperAdmin } from '@/app/actions/setup';

export default function SetupSuperAdminPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await createSuperAdmin({
      token,
      email,
      password,
      fullName,
    });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to create super admin');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold text-green-600">
            Super Admin Created Successfully!
          </h1>
          <p className="text-gray-600">
            You can now delete this route and sign in with your credentials.
          </p>
          <a
            href="/signin"
            className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Setup Super Admin
          </h1>
          <p className="mt-2 text-center text-sm text-red-600">
            ⚠️ This route should be deleted after setup
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Setup Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter setup token from .env"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Super Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Server Action:**

```typescript
// src/app/actions/setup.ts
'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

export async function createSuperAdmin({
  token,
  email,
  password,
  fullName,
}: {
  token: string;
  email: string;
  password: string;
  fullName: string;
}) {
  // Verify setup token
  if (token !== process.env.SUPER_ADMIN_SETUP_TOKEN) {
    return { success: false, error: 'Invalid setup token' };
  }

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Failed to create user' };
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
      });

    if (profileError) {
      return { success: false, error: 'Failed to create profile' };
    }

    // Assign super_admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'super_admin',
      });

    if (roleError) {
      return { success: false, error: 'Failed to assign role' };
    }

    // Log the action
    await supabaseAdmin.rpc('log_admin_action', {
      p_admin_id: authData.user.id,
      p_action_type: 'create_super_admin',
      p_target_user_id: authData.user.id,
      p_target_role: 'super_admin',
      p_new_data: { email, full_name: fullName },
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating super admin:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}
```

## User Management Pages

### 1. User List Page (`/users`)

**Features:**
- Paginated table of all users
- Search by name/email
- Filter by role
- Sort by created date, name, role
- Quick actions: Edit, View, Delete (super_admin only)
- Role badges with colors
- User status indicators

**Permissions:**
- super_admin: View all users
- admin: View all except super_admins
- support: View only (no actions)

### 2. Create User Page (`/users/new`)

**Features:**
- Form with email, password, full_name, role
- Role dropdown filtered by permissions
- Password strength indicator
- Validation before submission
- Success/error messages
- Automatic notification to super_admins (when admin creates support)

**Permissions:**
- super_admin: Can create admin, support, provider
- admin: Can create support only
- support: No access

### 3. Edit User Page (`/users/[id]/edit`)

**Features:**
- Edit profile information
- Change role (with permission validation)
- View audit log for this user
- Deactivate/activate user
- Reset password option

**Permissions:**
- super_admin: Edit any user
- admin: Edit support, provider, client
- support: No access

### 4. User Detail Page (`/users/[id]`)

**Features:**
- Full profile information
- Role and permissions
- Activity history
- Created bookings (if provider/client)
- Services (if provider)
- Audit log entries

## Permission Validation

### Server-Side Validation

All user management actions must validate permissions:

```typescript
export async function validateUserCreation(
  creatorId: string,
  targetRole: string
): Promise<{ allowed: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Get creator's role
  const { data: creatorRole } = await supabase.rpc('get_user_role', {
    user_id: creatorId
  });
  
  if (creatorRole === 'super_admin') {
    if (['admin', 'support', 'provider'].includes(targetRole)) {
      return { allowed: true };
    }
    return { allowed: false, error: 'Invalid role for super_admin to create' };
  }
  
  if (creatorRole === 'admin') {
    if (targetRole === 'support') {
      return { allowed: true };
    }
    return { allowed: false, error: 'Admins can only create support users' };
  }
  
  return { allowed: false, error: 'Insufficient permissions' };
}
```

## Audit Logging

### Logged Actions

- `create_user` - User creation
- `update_role` - Role change
- `update_profile` - Profile update
- `delete_user` - User deletion
- `deactivate_user` - User deactivation
- `activate_user` - User activation
- `reset_password` - Password reset

### Log Entry Example

```json
{
  "id": "uuid",
  "admin_id": "admin-uuid",
  "action_type": "create_user",
  "target_user_id": "new-user-uuid",
  "target_role": "support",
  "new_data": {
    "email": "support@example.com",
    "full_name": "Support User",
    "role": "support"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2025-12-26T10:00:00Z"
}
```

## Notification System

### When Admin Creates Support

1. Action is logged in `admin_actions_log`
2. Notification created in `pending_notifications` for all super_admins
3. Super_admins see notification in dashboard
4. Notification includes: who created, who was created, when

### Notification Format

```json
{
  "recipient_id": "super-admin-uuid",
  "notification_type": "user_created",
  "title": "New Support User Created",
  "message": "Admin John Doe created a new support user: support@example.com",
  "data": {
    "created_by": "admin-uuid",
    "created_by_name": "John Doe",
    "new_user_id": "support-uuid",
    "new_user_email": "support@example.com",
    "role": "support"
  },
  "priority": "medium"
}
```

## Implementation Checklist

### Database
- [ ] Create `admin_actions_log` table
- [ ] Create `pending_notifications` table
- [ ] Create `log_admin_action()` function
- [ ] Create `notify_super_admins()` function
- [ ] Create `create_user_with_role()` function
- [ ] Add RLS policies
- [ ] Create indexes

### Routes
- [ ] `/setup-super-admin` - Temporary setup route
- [ ] `/users` - User list
- [ ] `/users/new` - Create user
- [ ] `/users/[id]` - User detail
- [ ] `/users/[id]/edit` - Edit user

### Server Actions
- [ ] `createSuperAdmin()` - Setup action
- [ ] `createUser()` - Create user with validation
- [ ] `updateUser()` - Update user
- [ ] `updateUserRole()` - Change role
- [ ] `deleteUser()` - Delete user
- [ ] `getUserList()` - Get paginated users
- [ ] `getUserDetail()` - Get user details
- [ ] `getAuditLog()` - Get audit log entries

### Components
- [ ] UserTable - User list table
- [ ] UserForm - Create/edit form
- [ ] RoleBadge - Role display badge
- [ ] AuditLogTable - Audit log display
- [ ] NotificationBell - Notification indicator

### Testing
- [ ] Test super_admin creation
- [ ] Test permission validation
- [ ] Test audit logging
- [ ] Test notifications
- [ ] Test user CRUD operations

## Security Considerations

1. **Setup Route:** Delete `/setup-super-admin` after first use
2. **Token Security:** Use strong, random token for setup
3. **Permission Validation:** Always validate on server-side
4. **Audit Logging:** Log all administrative actions
5. **RLS Policies:** Ensure all tables have proper RLS
6. **Password Security:** Enforce strong password requirements
7. **Rate Limiting:** Consider rate limiting user creation

## Next Steps

After Phase 2A completion:
- Phase 2B - Full notification system with preferences
- Phase 2C - Campaign and promotion system

## References

- [Supabase Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [PostgreSQL Audit Logging](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
