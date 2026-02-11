const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = "postgresql://postgres:12345@inventario:5432/web_inventario";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Conexión exitosa a PostgreSQL');
    await prisma.$disconnect();
  } catch (error) {
    console.log('Error de conexión:', error.message);
  }
}

testConnection();
