import { NextResponse, type NextRequest } from 'next/server';

// Protect selected routes using a simple cookie-based guard.
// In dev, we read a lightweight cookie (set by frontend after login) with user role.
// Later, this can be replaced with Supabase auth helpers.

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/reset',
  '/api', // do not block API in middleware; API handlers do their own auth
  '/_next',
  '/public',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets and routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const role = req.cookies.get('role')?.value || '';

  // Admin section protection
  if (pathname.startsWith('/admin')) {
    if (role !== 'super_admin' && role !== 'company_admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Generic auth check: require some role cookie for app pages
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};


