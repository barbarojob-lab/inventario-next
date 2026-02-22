import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface AuthUser {
  companyId: string
  companyCode: string
  companyName: string
  iat?: number
  exp?: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'inventory-secret-key-2024'

export function verifyToken(request: NextRequest): AuthUser | null {
  try {
    // Check cookie first
    const token = request.cookies.get('token')?.value
    
    // Also check Authorization header
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    const validToken = token || bearerToken
    
    if (!validToken) {
      return null
    }

    const decoded = jwt.verify(validToken, JWT_SECRET) as AuthUser

    return decoded
  } catch {
    return null
  }
}

export function generateToken(companyId: string, companyCode: string, companyName: string): string {
  return jwt.sign(
    { companyId, companyCode, companyName },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}
