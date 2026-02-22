/* eslint-disable */
// Script para generar un archivo .env con valores seguros
// Uso: node setup-env.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const jwtSecret = crypto.randomBytes(64).toString('hex');

const envContent = `# ==========================================
# CONFIGURACIÓN DEL PROYECTO - INVENTARIO NEXT
# ==========================================

# Base de datos (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventario"

# ==========================================
# SEGURIDAD - AUTENTICACIÓN
# ==========================================

# Clave secreta para firmar tokens JWT (generada automáticamente)
JWT_SECRET="${jwtSecret}"

# URL pública de la aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;

const envPath = path.join(__dirname, '.env');

// Verificar si ya existe
if (fs.existsSync(envPath)) {
  console.log('⚠️  El archivo .env ya existe. No se sobrescribirá.');
  console.log('   Si necesitas regenerar, elimina el archivo .env primero.');
  process.exit(1);
}

// Crear el archivo
fs.writeFileSync(envPath, envContent);
console.log('✅ Archivo .env creado exitosamente');
console.log('   JWT_SECRET generado automáticamente');
console.log('');
console.log('⚠️  IMPORTANTE:');
console.log('   - Nunca compartas tu archivo .env');
console.log('   - Asegúrate de que esté en .gitignore');
console.log('   - Configura tu DATABASE_URL con los datos de tu servidor');
