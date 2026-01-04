import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  // Define public routes (accessible without authentication)
  const publicRoutes = [
    '/signin',
    '/signup',
    '/reset-password',
    '/update-password',
    '/unauthorized',
  ];

  // Define auth routes (accessible when authenticated)
  const authRoutes = [
    '/change-password',
  ];

  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Allow access to public routes without checks
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Redirect to signin if no user and accessing protected route
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Check for expired password (for authenticated users)
  if (user && !isAuthRoute) {
    try {
      const { data: hasExpired, error: expiredError } = await supabase.rpc('has_expired_password', {
        user_id: user.id,
      });

      if (expiredError) {
        console.error('Error checking password expiration:', expiredError);
      } else if (hasExpired) {
        // Redirect to change password page
        const url = request.nextUrl.clone();
        url.pathname = '/change-password';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Unexpected error checking password expiration:', error);
    }
  }

  // All authenticated users can access the dashboard
  // Role-based access control is handled at the page/component level
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
