import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const activateSchema = z.object({
  token: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = activateSchema.parse(body)

    // Buscar empresa por token de activación
    const company = await prisma.company.findFirst({
      where: { activationToken: token },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Token de activación inválido' },
        { status: 400 }
      )
    }

    // Verificar si ya está activa
    if (company.isActive) {
      return NextResponse.json(
        { error: 'La cuenta ya está activada' },
        { status: 400 }
      )
    }

    // Verificar si el token ha expirado
    if (company.activationExp && new Date() > company.activationExp) {
      return NextResponse.json(
        { error: 'El token de activación ha expirado. Solicita uno nuevo.' },
        { status: 400 }
      )
    }

    // Activar la cuenta
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        isActive: true,
        activationToken: null, // Limpiar token
        activationExp: null,
      },
    })

    return NextResponse.json({
      message: 'Cuenta activada exitosamente',
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        code: updatedCompany.code,
        email: updatedCompany.email,
      },
    })
  } catch (error) {
    console.error('Error en activación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
