# Phase 1.1 - Supabase Setup

**Status:** ✅ Complete  
**Date:** 2025-12-25

## Overview

Initial Supabase configuration for the Fixy Backoffice project, including client setup, TypeScript types generation, and environment configuration.

## Implementation Details

### 1. Dependencies Installed

```json
{
  "@supabase/ssr": "^0.8.0",
  "@supabase/supabase-js": "^2.89.0"
}
```

### 2. Supabase Clients Created

#### Browser Client (`src/lib/supabase/client.ts`)
- Used for client-side operations
- Uses `createBrowserClient` from `@supabase/ssr`
- Configured with public anon key

#### Server Client (`src/lib/supabase/server.ts`)
- Used for server-side operations (Server Components, API Routes)
- Uses `createServerClient` from `@supabase/ssr`
- Handles cookies for session management
- SSR-safe implementation

#### Admin Client (`src/lib/supabase/admin.ts`)
- Used for admin operations that bypass RLS
- Uses service role key
- No session persistence
- Should be used carefully (only in server-side code)

### 3. Environment Variables

**File:** `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://cvucdcgsoufrqubtftmg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Security Notes:**
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the client
- Service role key bypasses all RLS policies

### 4. TypeScript Types Generation

**Command:** `npm run gen-types`

**Script in package.json:**
```json
{
  "scripts": {
    "gen-types": "npx supabase gen types typescript --project-id \"cvucdcgsoufrqubtftmg\" > src/types/supabase.ts"
  }
}
```

**Generated File:** `src/types/supabase.ts`
- Auto-generated from Supabase schema
- Provides type safety for database operations
- Should be regenerated after schema changes

## Usage Examples

### Client-Side (Browser)

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);
```

### Server-Side (Server Components)

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);
```

### Admin Operations (Server-Side Only)

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin';

// Bypasses RLS - use with caution
const { data, error } = await supabaseAdmin
  .from('user_roles')
  .insert({ user_id: userId, role: 'admin' });
```

## Files Created

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/types/supabase.ts`

## Files Modified

- `package.json` (added gen-types script)
- `.env.local` (added Supabase credentials)

## Verification

Build passed successfully:
```bash
npm run build
# ✓ Compiled successfully
```

## Next Steps

- ✅ Phase 1.2 - Implement RBAC System
- ✅ Phase 1.3 - Add Middleware Protection

## References

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 16 App Router](https://nextjs.org/docs/app)
