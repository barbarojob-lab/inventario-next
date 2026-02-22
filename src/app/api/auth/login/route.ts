import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'inventory-secret-key-2024'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Buscar empresa por email
    const company = await prisma.company.findUnique({
      where: { email },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Correo no encontrado' },
        { status: 401 }
      )
    }

    // Verificar si la cuenta está activa
    if (!company.isActive) {
      return NextResponse.json(
        { 
          error: 'Cuenta no activada',
          needsActivation: true,
          companyCode: company.code,
        },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, company.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Generar token JWT con companyId
    const token = jwt.sign(
      { 
        companyId: company.id, 
        companyName: company.name,
        companyCode: company.code 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Crear respuesta con cookie
    const response = NextResponse.json({
      token,
      company: { 
        id: company.id, 
        name: company.name,
        code: company.code,
        email: company.email 
      }
    })

    // Establecer cookie HTTP-only
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
