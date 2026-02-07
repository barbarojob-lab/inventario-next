import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateStoreSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = parseInt(params.id)
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        products: true,
        closures: true,
      }
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error('Error obteniendo tienda:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = parseInt(params.id)
    const body = await request.json()
    const updateData = updateStoreSchema.parse(body)

    const store = await prisma.store.update({
      where: { id: storeId },
      data: updateData
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('Error actualizando tienda:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = parseInt(params.id)

    await prisma.store.delete({
      where: { id: storeId }
    })

    return NextResponse.json({ message: 'Tienda eliminada' })
  } catch (error) {
    console.error('Error eliminando tienda:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
