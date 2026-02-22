import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendActivationEmail } from '@/lib/email'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(4),
})

// Generar código único de empresa (INV-XXXXXX)
function generateCompanyCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'INV-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Generar token de activación usando crypto nativo
function generateActivationToken(): string {
  return crypto.randomUUID()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Verificar si el email ya existe
    const existingCompany = await prisma.company.findUnique({
      where: { email },
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Ya existe una empresa registrada con este correo' },
        { status: 400 }
      )
    }

    // Verificar si el código único ya existe (por seguridad)
    let companyCode = generateCompanyCode()
    let codeExists = await prisma.company.findUnique({
      where: { code: companyCode },
    })

    // Regenerar si ya existe
    while (codeExists) {
      companyCode = generateCompanyCode()
      codeExists = await prisma.company.findUnique({
        where: { code: companyCode },
      })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Token de activación (expira en 48 horas)
    const activationToken = generateActivationToken()
    const activationExp = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 horas

    // Crear empresa con tienda inicial en una transacción
    const result = await prisma.$transaction(async (tx) => {
      void result
      const company = await tx.company.create({
        data: {
          name,
          code: companyCode,
          email,
          password: hashedPassword,
          isActive: false,
          activationToken,
          activationExp,
        },
      })

      // Crear tienda inicial por defecto
      const store = await tx.store.create({
        data: {
          companyId: company.id,
          name: 'Tienda Principal',
          location: 'Principal',
        },
      })

      return { company, store }
    })

    // Enviar correo de activación
    const emailResult = await sendActivationEmail({
      email,
      name,
      companyCode,
      activationToken,
    })

    // Si el email falla, aún permitimos el registro (en desarrollo)
    if (!emailResult.success) {
      console.warn('⚠️ No se pudo enviar el email de activación:', emailResult.error)
    }

    // En desarrollo, retornamos el token para pruebas
    // En producción, esto se podría quitar
    const isDev = process.env.NODE_ENV !== 'production'

    return NextResponse.json({
      message: 'Empresa registrada exitosamente',
      needsActivation: true,
      email: email,
      ...(isDev && { devToken: activationToken }),
      companyCode: companyCode,
      emailSent: emailResult.success,
    })
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
