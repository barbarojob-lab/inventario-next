const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = "postgresql://postgres:12345@localhost:5432/web_inventario";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function addData() {
  try {
    console.log('Agregando datos permanentes a la base de datos...');

    // Agregar 2 tiendas
    const store1 = await prisma.store.create({
      data: {
        name: 'Tienda Central',
        location: 'Centro de la Ciudad'
      }
    });
    console.log('Tienda 1 agregada:', store1);

    const store2 = await prisma.store.create({
      data: {
        name: 'Tienda Norte',
        location: 'Zona Norte'
      }
    });
    console.log('Tienda 2 agregada:', store2);

    // Agregar varios productos a cada tienda
    const productsData = [
      { storeId: store1.id, code: 'P001', name: 'Producto A', price: 10.5, cost: 7.0, qty: 100 },
      { storeId: store1.id, code: 'P002', name: 'Producto B', price: 15.0, cost: 10.0, qty: 50 },
      { storeId: store1.id, code: 'P003', name: 'Producto C', price: 20.0, cost: 12.0, qty: 75 },
      { storeId: store2.id, code: 'P004', name: 'Producto D', price: 25.0, cost: 18.0, qty: 30 },
      { storeId: store2.id, code: 'P005', name: 'Producto E', price: 30.0, cost: 20.0, qty: 40 },
      { storeId: store2.id, code: 'P006', name: 'Producto F', price: 35.0, cost: 25.0, qty: 60 }
    ];

    for (const product of productsData) {
      const newProduct = await prisma.product.create({
        data: product
      });
      console.log('Producto agregado:', newProduct);
    }

    console.log('Datos agregados exitosamente.');
    await prisma.$disconnect();
  } catch (error) {
    console.log('Error al agregar datos:', error.message);
  }
}

addData();
