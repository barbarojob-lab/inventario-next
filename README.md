# inventario-next

Aplicación de inventario construida con Next.js y TypeScript

Descripción

Inventario Next es una aplicación web para gestionar productos y existencias. Permite crear, leer, actualizar y eliminar productos, realizar búsquedas y filtrar por categorías, y gestionar entradas y salidas de stock. Está diseñada para desplegarse en Vercel u otros proveedores compatibles con Next.js.

Características

- CRUD completo de productos
- Búsqueda y filtrado avanzados
- Interfaz responsive (móvil y escritorio)
- Páginas protegidas (autenticación) — opcional
- API interna para operaciones de inventario

Tecnologías

- Next.js (App Router)
- TypeScript
- React
- (Opcional) Prisma / MongoDB / PostgreSQL
- (Opcional) Tailwind CSS / CSS Modules

Requisitos

- Node.js 16 o superior
- npm, yarn o pnpm

Variables de entorno recomendadas (.env)

- DATABASE_URL=
- NEXT_PUBLIC_API_URL=
- NEXTAUTH_URL=
- NEXTAUTH_SECRET=

Instalación y ejecución

1. Clona el repositorio

   git clone https://github.com/barbarojob-lab/inventario-next.git
   cd inventario-next

2. Instala dependencias

   npm install
   # o
   yarn
   # o
   pnpm install

3. Añade un archivo `.env` con las variables necesarias.

4. Ejecuta en modo desarrollo

   npm run dev

5. Genera build para producción

   npm run build
   npm start

Estructura recomendada

- /app o /pages — Rutas de la aplicación
- /components — Componentes React reutilizables
- /lib — Clientes API y utilidades
- /styles — Archivos CSS o configuraciones de Tailwind
- /prisma o /db — Migraciones y esquema (si aplica)

Despliegue

- Recomendado: Vercel. Configura las variables de entorno en el panel de Vercel.
- Alternativa: Netlify (con adaptaciones), Docker en un VPS, o servicios compatibles con Node.js.

Contribuir

1. Haz fork del proyecto y crea una rama para tu feature

   git checkout -b feat/nombre-feature

2. Abre un Pull Request describiendo los cambios y el motivo.

Licencia

Especifica la licencia que prefieres (p.ej. MIT). Puedo añadir un archivo LICENSE si lo deseas.

Contacto

https://github.com/barbarojob-lab
