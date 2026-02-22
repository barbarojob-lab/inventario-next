import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'inventory-secret-key-2024'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/activate',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/activate'
  ]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for authentication token from cookie
  const token = request.cookies.get('token')?.value

  // Also check Authorization header for API routes
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const validToken = token || bearerToken

  if (!validToken) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token and extract company info
  try {
    const decoded = jwt.verify(validToken, JWT_SECRET) as { companyId: string; companyCode: string }
    
    // Create response with company info in headers for API routes
    const response = NextResponse.next()
    
    // Add company info headers for API routes
    if (pathname.startsWith('/api/')) {
      response.headers.set('x-company-id', decoded.companyId || '')
      response.headers.set('x-company-code', decoded.companyCode || '')
    }
    
    return response
  } catch {
    // Invalid token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
