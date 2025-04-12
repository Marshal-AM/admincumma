import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware runs on all routes
export function middleware(request: NextRequest) {
  // Create a response object from the incoming request
  const response = NextResponse.next()
  
  // Add cache control headers to prevent caching on all routes
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  // Add a timestamp to query parameters to bust any cache
  const url = request.nextUrl.clone()
  
  // Only add timestamp to GET requests
  if (request.method === 'GET' && !url.searchParams.has('_t')) {
    url.searchParams.set('_t', Date.now().toString())
    return NextResponse.rewrite(url)
  }
  
  return response
}

// Configure the matcher to apply the middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 