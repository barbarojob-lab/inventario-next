import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Temporarily disabled authentication
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
