import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createSaleSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    const sales = await prisma.sale.findMany({
      where: storeId ? {
        product: {
          storeId: parseInt(storeId)
        }
      } : undefined,
      include: {
        product: {
          select: { name: true, price: true, cost: true, store: { select: { name: true } } }
        }
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error obteniendo ventas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity } = createSaleSchema.parse(body)

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

    // Create sale and update stock in transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const total = product.price * quantity
      const costUnit = product.cost
      const profitTotal = (product.price - product.cost) * quantity

      const sale = await tx.sale.create({
        data: {
          productId,
          quantity,
          total,
          costUnit,
          profitTotal
        },
        include: {
          product: {
            select: { name: true, price: true, cost: true }
          }
        }
      })

      await tx.product.update({
        where: { id: productId },
        data: { qty: { decrement: quantity } }
      })

      return sale
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creando venta:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
