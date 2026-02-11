import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Usuario ya existe' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: { id: user.id, username: user.username }
    })
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
