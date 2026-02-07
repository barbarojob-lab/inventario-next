import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createStoreSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
})

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(stores)
  } catch (error) {
    console.error('Error obteniendo tiendas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, location } = createStoreSchema.parse(body)

    const store = await prisma.store.create({
      data: { name, location }
    })

    return NextResponse.json(store, { status: 201 })
  } catch (error) {
    console.error('Error creando tienda:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
