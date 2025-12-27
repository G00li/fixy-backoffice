# Phase 1.2 - RBAC System

**Status:** ✅ Complete  
**Date:** 2025-12-26

## Overview

Implementation of Role-Based Access Control (RBAC) system with 5 hierarchical roles and comprehensive database functions for permission management.

## Role Hierarchy

```
super_admin  → Full system access (manage admins, critical configs)
    ↓
admin        → Manage users, services, categories, bookings
    ↓
support      → View all, edit bookings, provide support
    ↓
provider     → Manage own services, bookings, profile
    ↓
client       → Manage own profile, create bookings
```

## Database Schema

### Table: `user_roles`

```sql
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support', 'provider', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_user_roles_user_id` on `user_id`
- `idx_user_roles_role` on `role`
- `idx_user_roles_created_at` on `created_at`

**RLS Policies:**
- Users can view their own role
- Super admins can manage all roles
- Admins can manage non-super-admin roles

### View: `users_with_roles`

Joins `profiles` with `user_roles` for convenient querying:

```sql
CREATE VIEW users_with_roles AS
SELECT 
  p.*,
  ur.role,
  ur.created_at as role_assigned_at
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id;
```

## RBAC Functions

### Core Functions

#### `is_super_admin(user_id UUID)`
Returns `BOOLEAN`

Checks if user has `super_admin` role (highest privilege).

```sql
SELECT is_super_admin(auth.uid());
```

#### `is_admin(user_id UUID)`
Returns `BOOLEAN`

Checks if user has `admin` or `super_admin` role.

```sql
SELECT is_admin(auth.uid());
```

#### `is_admin_or_above(user_id UUID)`
Returns `BOOLEAN`

Alias for `is_admin()` - checks for admin or super_admin.

#### `is_support_or_above(user_id UUID)`
Returns `BOOLEAN`

Checks if user has `support`, `admin`, or `super_admin` role.

```sql
SELECT is_support_or_above(auth.uid());
```

#### `is_provider(user_id UUID)`
Returns `BOOLEAN`

Checks if user has `provider` role.

#### `is_client(user_id UUID)`
Returns `BOOLEAN`

Checks if user has `client` role.

#### `get_user_role(user_id UUID)`
Returns `TEXT`

Returns the user's role as text, or `NULL` if no role assigned.

```sql
SELECT get_user_role(auth.uid());
-- Returns: 'admin', 'support', etc.
```

#### `has_role(user_id UUID, allowed_roles TEXT[])`
Returns `BOOLEAN`

Checks if user has any of the specified roles.

```sql
SELECT has_role(auth.uid(), ARRAY['admin', 'support']);
```

## Triggers

### `update_user_roles_updated_at`
Automatically updates `updated_at` timestamp when role is modified.

### `on_auth_user_created`
Automatically assigns `client` role to new users upon registration.

## Migrations Applied

1. `20251225234255_remove_role_from_profiles.sql` - Removed role from profiles table
2. `20251225234300_create_user_roles_table.sql` - Created user_roles table with RLS
3. `20251225234305_create_rbac_functions.sql` - Created RBAC helper functions
4. `20251225234310_create_rbac_triggers.sql` - Created auto-update triggers
5. `20251225234315_create_users_with_roles_view.sql` - Created users_with_roles view
6. `20251225234320_update_profiles_policies.sql` - Updated RLS policies
7. `20251226000000_update_user_roles_constraint.sql` - Updated to 5-role hierarchy
8. `20251226000100_update_rbac_functions.sql` - Added new RBAC functions
9. `20251226000200_update_rbac_policies.sql` - Updated RLS policies for new hierarchy

## Permission Matrix

### User Creation

| Role        | Can Create                    | Notes                          |
|-------------|-------------------------------|--------------------------------|
| super_admin | admin, support, provider      | Full control                   |
| admin       | support                       | Notifies super_admin           |
| support     | -                             | Cannot create users            |
| provider    | -                             | Cannot create users            |
| client      | -                             | Cannot create users            |

### Role Management

| Role        | Can Manage                    | Notes                          |
|-------------|-------------------------------|--------------------------------|
| super_admin | All roles                     | Including other super_admins   |
| admin       | support, provider, client     | Cannot manage admins           |
| support     | -                             | Cannot manage roles            |

### Data Access

| Role        | Access Level                  |
|-------------|-------------------------------|
| super_admin | Full access to all data       |
| admin       | All users except super_admins |
| support     | View all, limited edit        |
| provider    | Own data only                 |
| client      | Own data only                 |

## Usage in Code

### Server Actions

```typescript
import { createClient } from '@/lib/supabase/server';

export async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data: isAdmin } = await supabase.rpc('is_admin', {
    user_id: user.id
  });
  
  return isAdmin === true;
}
```

### RLS Policies

```sql
-- Example: Only admins and above can update profiles
CREATE POLICY "Admins can update profiles"
  ON profiles
  FOR UPDATE
  USING (is_admin_or_above());
```

## Security Considerations

1. **Service Role Key:** Never expose to client-side code
2. **RLS Policies:** Always enabled on all tables
3. **Function Security:** All RBAC functions use `SECURITY DEFINER`
4. **Audit Trail:** Consider logging role changes (Phase 2A)

## Testing

Verify RBAC functions:

```sql
-- Test super_admin check
SELECT is_super_admin('user-uuid-here');

-- Test role retrieval
SELECT get_user_role('user-uuid-here');

-- Test multiple role check
SELECT has_role('user-uuid-here', ARRAY['admin', 'support']);
```

## Files Created

- `fixy-supabase/supabase/migrations/20251225234255_remove_role_from_profiles.sql`
- `fixy-supabase/supabase/migrations/20251225234300_create_user_roles_table.sql`
- `fixy-supabase/supabase/migrations/20251225234305_create_rbac_functions.sql`
- `fixy-supabase/supabase/migrations/20251225234310_create_rbac_triggers.sql`
- `fixy-supabase/supabase/migrations/20251225234315_create_users_with_roles_view.sql`
- `fixy-supabase/supabase/migrations/20251225234320_update_profiles_policies.sql`
- `fixy-supabase/supabase/migrations/20251226000000_update_user_roles_constraint.sql`
- `fixy-supabase/supabase/migrations/20251226000100_update_rbac_functions.sql`
- `fixy-supabase/supabase/migrations/20251226000200_update_rbac_policies.sql`
- `fixy-supabase/supabase/migrations/README.md`

## Files Modified

- `fixy-backoffice/src/types/supabase.ts` (regenerated)

## Next Steps

- ✅ Phase 1.3 - Implement Middleware Protection
- 🔄 Phase 2A - User Management with RBAC enforcement

## References

- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
