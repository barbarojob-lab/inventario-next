import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para crear empresa (admin) - NO requiere código
const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(4),
})

// Schema para registrar empleado (con código de empresa)
const registerEmployeeSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(4),
  companyCode: z.string().min(1),
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

// POST: /api/auth/register
// Puede ser:
// 1. Crear nueva empresa (sin companyCode)
// 2. Registrar empleado (con companyCode)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar si viene companyCode para saber si es empleado o nuevo admin
    const hasCompanyCode = body.companyCode && body.companyCode.trim() !== ''
    
    if (hasCompanyCode) {
      // === REGISTRO DE EMPLEADO ===
      const { name, email, password, companyCode } = registerEmployeeSchema.parse(body)
      
      // Buscar la empresa por código
      const company = await prisma.company.findUnique({
        where: { code: companyCode.toUpperCase() },
      })
      
      if (!company) {
        return NextResponse.json(
          { error: 'Código de empresa inválido. Verifica el código e intenta nuevamente.' },
          { status: 400 }
        )
      }
      
      // Verificar si el email ya está registrado en esta empresa
      const existingUser = await prisma.company.findFirst({
        where: { email, id: company.id },
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este correo en esta empresa' },
          { status: 400 }
        )
      }
      
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Crear empleado (se vincula a la empresa existente)
      await prisma.company.create({
        data: {
          name,
          email,
          password: hashedPassword,
          code: generateCompanyCode(),
          isActive: true,
        },
      })
      
      return NextResponse.json({
        message: 'Empleado registrado exitosamente',
        success: true,
        companyName: company.name,
        companyCode: company.code,
      })
      
    } else {
      // === CREAR NUEVA EMPRESA (ADMIN) ===
      const { name, email, password } = createCompanySchema.parse(body)
      
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
      
      // Generar código único de empresa
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
      
      // Crear empresa con tienda inicial
      await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name: name,
            code: companyCode,
            email: email,
            password: hashedPassword,
            isActive: true,
          },
        })
        
        await tx.store.create({
          data: {
            companyId: company.id,
            name: 'Tienda Principal',
            location: 'Principal',
          },
        })
      })
      
      return NextResponse.json({
        message: 'Empresa creada exitosamente',
        success: true,
        companyCode: companyCode,
        companyName: name,
      })
    }
    
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
