import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProductSchema = z.object({
  storeId: z.number().int().positive(),
  code: z.string().optional(),
  name: z.string().min(1),
  price: z.number().positive(),
  cost: z.number().min(0).default(0),
  qty: z.number().int().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    const products = await prisma.product.findMany({
      where: storeId ? { storeId: parseInt(storeId) } : undefined,
      include: {
        store: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const productData = createProductSchema.parse(body)

    // Check if product with same name exists in store
    const existingProduct = await prisma.product.findFirst({
      where: {
        storeId: productData.storeId,
        name: {
          equals: productData.name,
          mode: 'insensitive'
        }
      }
    })

    if (existingProduct) {
      return NextResponse.json({ error: 'Ya existe un producto con este nombre en la tienda' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: productData,
      include: {
        store: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creando producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
