import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { verifyToken } from '@/lib/auth'

const createWasteSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authUser = verifyToken(request)
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const wastes = await prisma.waste.findMany({
      where: {
        product: { store: { companyId: authUser.companyId } }
      },
      include: {
        product: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(wastes)
  } catch (error) {
    console.error('Error obteniendo mermas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = verifyToken(request)
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity, reason } = createWasteSchema.parse(body)

    // Check if product exists and belongs to company
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: { companyId: authUser.companyId }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (product.qty < quantity) {
      return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 })
    }

    // Create waste and update stock in transaction
    const result = await prisma.$transaction(async (tx) => {
      const waste = await tx.waste.create({
        data: {
          productId,
          quantity,
          reason
        },
        include: {
          product: {
            select: { name: true }
          }
        }
      })

      await tx.product.update({
        where: { id: productId },
        data: { qty: { decrement: quantity } }
      })

      return waste
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creando merma:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
