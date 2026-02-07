import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  cost: z.number().min(0).optional(),
  qty: z.number().int().min(0).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: { name: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)
    const body = await request.json()
    const updateData = updateProductSchema.parse(body)

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        store: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error actualizando producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)

    await prisma.product.delete({
      where: { id: productId }
    })

    return NextResponse.json({ message: 'Producto eliminado' })
  } catch (error) {
    console.error('Error eliminando producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
