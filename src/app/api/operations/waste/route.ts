import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createWasteSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
})

export async function GET() {
  try {
    const waste = await prisma.waste.findMany({
      include: {
        product: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(waste)
  } catch (error) {
    console.error('Error obteniendo merma:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, reason } = createWasteSchema.parse(body)

    // Check if product has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (product.qty < quantity) {
      return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 })
    }

    // Create waste and update stock in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const waste = await tx.waste.create({
        data: { productId, quantity, reason },
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
