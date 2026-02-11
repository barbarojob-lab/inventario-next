import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface AuthUser {
  userId: string
  username: string
}

export function verifyToken(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthUser

    return decoded
  } catch {
    return null
  }
}
