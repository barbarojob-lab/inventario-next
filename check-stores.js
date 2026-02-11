const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = "postgresql://postgres:12345@localhost:5432/web_inventario";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function checkStores() {
  try {
    const stores = await prisma.store.findMany();
    console.log('Tiendas actuales en la base de datos:');
    console.log(stores);
    await prisma.$disconnect();
  } catch (error) {
    console.log('Error al consultar tiendas:', error.message);
  }
}

checkStores();
