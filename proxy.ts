// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * The 'proxy' function replaces 'middleware' in Next.js 16.
 * It intercepts requests before they reach your page or layout.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('woo-token')
  const { pathname } = request.nextUrl

  // 1. Check if the user is trying to access a protected /account route
  if (pathname.startsWith('/account') && !token) {
    // 2. Redirect to login if the woo-token cookie is missing
    const loginUrl = new URL('/login', request.url)
    
    // Optional: Add a redirect parameter so users return to the account page after login
    loginUrl.searchParams.set('callbackUrl', pathname)
    
    return NextResponse.redirect(loginUrl)
  }

  // 3. Allow the request to proceed if checks pass
  return NextResponse.next()
}

/**
 * Matcher ensures the proxy only runs on specific routes, 
 * saving resources on static assets or public pages.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/account/:path*',
  ],
}
