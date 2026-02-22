import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const createPurchaseSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  costUnit: z.number().positive(),
})

export async function GET(request: NextRequest) {
  try {
    const authUser = verifyToken(request)
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    const purchases = await prisma.purchase.findMany({
      where: {
        product: {
          store: { companyId: authUser.companyId },
          ...(storeId ? { storeId: parseInt(storeId) } : {})
        }
      },
      include: {
        product: {
          select: { name: true, store: { select: { name: true } } }
        }
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error obteniendo compras:', error)
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
    const { productId, quantity, costUnit } = createPurchaseSchema.parse(body)

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

    // Create purchase and update stock in transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const total = costUnit * quantity

      const purchase = await tx.purchase.create({
        data: {
          productId,
          quantity,
          costUnit,
          total
        },
        include: {
          product: {
            select: { name: true }
          }
        }
      })

      await tx.product.update({
        where: { id: productId },
        data: { qty: { increment: quantity } }
      })

      return purchase
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creando compra:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
