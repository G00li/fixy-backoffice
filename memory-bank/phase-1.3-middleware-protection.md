# Phase 1.3 - Middleware Protection

**Status:** ✅ Complete  
**Date:** 2025-12-26

## Overview

Implementation of Next.js middleware for route protection, authentication verification, and role-based access control. Only authenticated users with `admin` or `super_admin` roles can access the backoffice.

## Architecture

### Authentication Flow

```
User Request
    ↓
Middleware Intercepts
    ↓
Public Route? → Yes → Allow Access
    ↓ No
Authenticated? → No → Redirect to /signin
    ↓ Yes
is_admin()? → No → Redirect to /unauthorized
    ↓ Yes
Allow Access to Dashboard
```

## Implementation Details

### 1. Middleware (`src/middleware.ts`)

**Purpose:** Intercept all requests and enforce authentication + authorization

**Key Features:**
- Checks authentication status using Supabase
- Validates admin role using `is_admin()` RPC function
- Handles cookie management for SSR
- Redirects unauthenticated users to `/signin`
- Redirects non-admins to `/unauthorized`
- Prevents logged-in admins from accessing `/signin`

**Protected Routes:**
- All routes in `(admin)/*`
- Requires: Authentication + Admin Role

**Public Routes:**
- `/signin` - Login page
- `/signup` - Registration page
- `/reset-password` - Password reset request
- `/update-password` - Password update
- `/unauthorized` - 403 error page

**Matcher Configuration:**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

Excludes:
- Static files (`_next/static`)
- Image optimization (`_next/image`)
- Favicon
- Image files (svg, png, jpg, etc.)

### 2. Server Actions (`src/app/actions/auth.ts`)

#### `login(email: string, password: string)`

**Purpose:** Authenticate user and verify admin role

**Flow:**
1. Sign in with Supabase Auth
2. Check if user has admin role using `is_admin()` RPC
3. If not admin, sign out and return error
4. If admin, revalidate layout and return success

**Returns:**
```typescript
{ success: boolean; error?: string }
```

**Security:**
- Validates admin role before allowing access
- Signs out non-admin users immediately
- Revalidates Next.js cache after successful login

#### `logout()`

**Purpose:** Sign out user and redirect to login

**Flow:**
1. Sign out from Supabase
2. Revalidate layout
3. Redirect to `/signin`

#### `getCurrentUser()`

**Purpose:** Get authenticated user with profile and role

**Returns:**
```typescript
{
  user: User;
  profile: Profile;
  role: string | null;
} | null
```

**Usage:**
```typescript
const userData = await getCurrentUser();
if (userData?.role === 'super_admin') {
  // Super admin specific logic
}
```

#### `requestPasswordReset(email: string)`

**Purpose:** Send password reset email

**Returns:**
```typescript
{ success: boolean; error?: string }
```

#### `updatePassword(newPassword: string)`

**Purpose:** Update user password

**Returns:**
```typescript
{ success: boolean; error?: string }
```

### 3. Sign In Form (`src/components/auth/SignInForm.tsx`)

**Features:**
- Email and password inputs
- Show/hide password toggle
- Loading states during authentication
- Error message display
- Redirect to intended page after login
- Remember me checkbox (UI only)
- Forgot password link

**Form Handling:**
- Uses native HTML form with FormData
- Calls `login()` server action
- Handles success/error states
- Redirects on successful login

**Suspense Boundary:**
- Wrapped in `<Suspense>` in page component
- Required for `useSearchParams()` hook
- Prevents SSR errors

### 4. Unauthorized Page (`src/app/(full-width-pages)/(error-pages)/unauthorized/page.tsx`)

**Purpose:** 403 Access Denied page

**Features:**
- Clear error message
- 403 status code display
- Lock icon visual
- Links to login and dashboard
- Consistent with theme design
- Helpful explanation for users

**When Shown:**
- User is authenticated but not an admin
- User tries to access protected routes without permission

## Security Features

### 1. Cookie Management

Middleware properly handles Supabase cookies for SSR:

```typescript
cookies: {
  getAll() {
    return request.cookies.getAll();
  },
  setAll(cookiesToSet) {
    cookiesToSet.forEach(({ name, value, options }) =>
      supabaseResponse.cookies.set(name, value, options)
    );
  },
}
```

### 2. Role Verification

Uses database RPC function instead of client-side checks:

```typescript
const { data: isAdmin } = await supabase.rpc('is_admin', {
  user_id: user.id,
});
```

**Why RPC?**
- Server-side verification
- Cannot be bypassed by client
- Uses database-level security
- Consistent with RLS policies

### 3. Error Handling

Graceful error handling in middleware:

```typescript
try {
  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  
  if (error) {
    console.error('Error checking admin role:', error);
    return NextResponse.redirect('/unauthorized');
  }
} catch (error) {
  console.error('Unexpected error:', error);
  return NextResponse.redirect('/unauthorized');
}
```

### 4. Redirect Protection

Prevents redirect loops:
- Logged-in admins redirected away from `/signin`
- Non-admins redirected to `/unauthorized` (not `/signin`)
- Preserves intended destination in `redirectTo` param

## Files Created

- `src/middleware.ts`
- `src/app/actions/auth.ts`
- `src/app/(full-width-pages)/(error-pages)/unauthorized/page.tsx`

## Files Modified

- `src/components/auth/SignInForm.tsx` (integrated with Supabase)
- `src/app/(full-width-pages)/(auth)/signin/page.tsx` (added Suspense)

## Testing Scenarios

### 1. Unauthenticated User
- Access `/` → Redirected to `/signin`
- Access `/profile` → Redirected to `/signin`
- Access `/signin` → Allowed

### 2. Authenticated Non-Admin
- Login with provider/client account
- Immediately signed out
- Error: "Access denied. Admin privileges required."

### 3. Authenticated Admin
- Login successful
- Access to all dashboard routes
- Cannot access `/signin` (redirected to `/`)

### 4. Authenticated Super Admin
- Same as admin
- Additional permissions in UI (Phase 2+)

## Performance Considerations

### Middleware Optimization

- Runs on every request (except excluded paths)
- Uses efficient RPC call for role check
- Minimal database queries
- Cached authentication state

### Build Output

```
Route (app)
├ ○ / (protected)
├ ○ /signin (public)
├ ○ /unauthorized (public)
└ ƒ Proxy (Middleware)

○  (Static)  prerendered as static content
ƒ  Proxy (Middleware)
```

## Known Issues

### Next.js 16 Warning

```
⚠ The "middleware" file convention is deprecated. 
  Please use "proxy" instead.
```

**Status:** Warning only, functionality works correctly  
**Action:** Monitor Next.js updates for migration path

## Next Steps

- 🔄 Phase 2A - User Management (create/edit users)
- ⏳ Phase 2A - Password reset pages
- ⏳ Phase 2A - Logout button in header
- ⏳ Phase 2A - User profile display

## References

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
