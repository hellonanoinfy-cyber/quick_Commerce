import { NextResponse } from 'next/server';

// ===================================================
// PUBLIC ROUTES (no authentication required)
// ===================================================
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/verify-otp',
  '/admin/login',
  '/products',
  '/products/*',
  '/categories',
  '/categories/*',
  '/search',
  '/api/health',
  '/api/v1/auth/send-otp',
  '/api/v1/auth/verify-otp',
  '/api/v1/auth/refresh-token',
  '/_next',
  '/favicon.ico',
];

// ===================================================
// AUTHENTICATED ROUTES (require login)
// ===================================================
// Beta: login is optional. Storefront pages (cart, checkout, orders, profile,
// wishlist, addresses) work without registration; the checkout step routes to
// the existing "Payments coming soon" page. Only admin remains gated.
const PROTECTED_ROUTES = [];

// ===================================================
// ADMIN ROUTES (require admin role)
// ===================================================
const ADMIN_ROUTES = ['/admin', '/admin/*'];

// ===================================================
// GUEST ROUTES (only for guest users)
// ===================================================
const GUEST_ROUTES = ['/onboarding', '/onboarding/*'];

// ===================================================
// TOKEN CONFIGURATION
// ===================================================
const TOKEN_COOKIE_NAME = 'firstcry_auth_token';
const USER_DATA_COOKIE_NAME = 'firstcry_user';

// ===================================================
// HELPER FUNCTIONS
// ===================================================

/**
 * Check if a path matches any route pattern.
 * Fixed: wildcard patterns MUST have a trailing '/' before '*' so that
 * '/auth/*' does NOT match '/auth/login' (only '/auth/x' segments).
 */
function matchesRoute(pathname, routes) {
  return routes.some(route => {
    if (route.endsWith('*')) {
      // Wildcard pattern — prefix must match, and the char before '*'
      // must be '/' so sub-paths are matched, not exact prefixes.
      const prefix = route.slice(0, -1); // drop trailing '*'
      return pathname.startsWith(prefix) && pathname.length >= prefix.length;
    }
    return pathname === route;
  });
}

function isPublicRoute(pathname) {
  return matchesRoute(pathname, PUBLIC_ROUTES);
}

function isProtectedRoute(pathname) {
  return matchesRoute(pathname, PROTECTED_ROUTES);
}

function isAdminRoute(pathname) {
  return matchesRoute(pathname, ADMIN_ROUTES);
}

function isGuestRoute(pathname) {
  return matchesRoute(pathname, GUEST_ROUTES);
}

/**
 * Parse JWT token using Buffer (Node.js compatible)
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired.
 * Returns true if token is invalid or past its expiry.
 */
function isTokenExpired(tokenPayload) {
  if (!tokenPayload) return true;
  const exp = tokenPayload.exp;
  if (!exp) return false; // no expiry claim — treat as valid
  return Date.now() >= exp * 1000;
}

// ===================================================
// SECURITY HEADERS HELPER
// ===================================================
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
};

function withSecurityHeaders(response) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

// ===================================================
// MIDDLEWARE FUNCTION
// ===================================================

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  // Get auth token from cookies
  const authToken = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const userDataStr = req.cookies.get(USER_DATA_COOKIE_NAME)?.value;

  let userData = null;
  let tokenPayload = null;

  if (authToken) {
    tokenPayload = parseJwt(authToken);
    if (tokenPayload) {
      // Reject expired tokens immediately — don't let them into protected routes
      if (isTokenExpired(tokenPayload)) {
        const loginUrl = new URL('/auth/login', req.url);
        const response = NextResponse.redirect(loginUrl);
        return withSecurityHeaders(response);
      }
      userData = {
        role:
          tokenPayload.role ||
          tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          'user',
        isGuest: tokenPayload.isGuest || false,
      };
    }
  }

  // Parse user data from cookie if available (fallback when token is absent)
  if (userDataStr && !userData) {
    try {
      userData = JSON.parse(decodeURIComponent(userDataStr));
    } catch {
      // Keep parsed data from JWT
    }
  }

  const isAuthenticated = !!authToken && !!tokenPayload && !isTokenExpired(tokenPayload);
  const userRole = String(userData?.role || 'guest').toLowerCase();
  const isGuest = userData?.isGuest ?? true;

  // Check guest routes - authenticated non-guest users should not access
  if (isGuestRoute(pathname)) {
    if (isAuthenticated && !isGuest) {
      // Logged in as non-guest, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Allow guests or unauthenticated
    return NextResponse.next();
  }

  // Check protected and admin routes
  if (isProtectedRoute(pathname) || isAdminRoute(pathname)) {
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin role
    if (isAdminRoute(pathname) && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

// ===================================================
// CONFIG
// ===================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
