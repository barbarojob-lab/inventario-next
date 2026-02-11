const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = "postgresql://postgres:12345@localhost:5432/web_inventario";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function testCRUD() {
  try {
    console.log('Probando conexión y operaciones CRUD...');

    // CREATE: Agregar una tienda
    const newStore = await prisma.store.create({
      data: {
        name: 'Tienda de Prueba',
        location: 'Ubicación de Prueba'
      }
    });
    console.log('Tienda creada:', newStore);

    // READ: Leer todas las tiendas
    const stores = await prisma.store.findMany();
    console.log('Tiendas en la base de datos:', stores);

    // UPDATE: Actualizar la tienda creada
    const updatedStore = await prisma.store.update({
      where: { id: newStore.id },
      data: { name: 'Tienda Actualizada' }
    });
    console.log('Tienda actualizada:', updatedStore);

    // DELETE: Eliminar la tienda
    await prisma.store.delete({
      where: { id: newStore.id }
    });
    console.log('Tienda eliminada exitosamente.');

    // Verificar que se eliminó
    const storesAfterDelete = await prisma.store.findMany();
    console.log('Tiendas después de eliminar:', storesAfterDelete);

    await prisma.$disconnect();
    console.log('Pruebas CRUD completadas exitosamente.');
  } catch (error) {
    console.log('Error durante las pruebas CRUD:', error.message);
  }
}

testCRUD();
