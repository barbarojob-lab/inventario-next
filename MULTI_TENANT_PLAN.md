# Sistema de Autenticación Multi-Tenant

## Visión General
Sistema de inventario donde cada empresa tiene su propio espacio aislado con código único de acceso.

---

## Fase 1: Actualizar Modelos de Datos (Prisma) ✅ COMPLETADO

### Objetivos:
- [x] Agregar modelo `Company` con:
  - `id` (UUID)
  - `name` (nombre de la empresa)
  - `code` (código único: ej INV-ABC123)
  - `email` (correo del administrador)
  - `password` (hash de contraseña)
  - `isActive` (si la cuenta está activada)
  - `activationToken` (token para activar cuenta)
  - `createdAt`, `updatedAt`
- [x] Eliminar modelo `User` existente
- [ ] Ejecutar migración (pendiente de confirmarte)

### Modelo Prisma Propuesto:
```
prisma
model Company {
  id              String   @id @default(uuid())
  name            String
  code            String   @unique // Código único de acceso: INV-ABC123
  email           String   @unique
  password        String
  isActive        Boolean  @default(false)
  activationToken String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## Fase 2: Actualizar APIs de Autenticación ✅ COMPLETADO

### Registro (`/api/auth/register`):
- [x] Recibe: name, email, password
- [x] Genera código único de empresa (INV-XXXXXX)
- [x] Genera token de activación
- [x] Guarda en BD (isActive: false)
- [x] Envía correo de activación (simulado en consola)

### Activación (`/api/auth/activate`):
- [x] Recibe: activationToken
- [x] Busca empresa por token
- [x] Activa cuenta (isActive: true)
- [x] Limpia token de activación
- [x] Verifica expiración del token

### Login (`/api/auth/login`):
- [x] Recibe: email, password
- [x] Verifica que isActive sea true
- [x] Retorna token JWT con companyId, companyName, companyCode
- [x] Establece cookie HTTP-only

---

## Fase 3: Actualizar Páginas de UI ✅ COMPLETADO

### Página de Registro:
- [x] Nombre de Empresa (input)
- [x] Correo electrónico (input)
- [x] Contraseña (input)
- [x] Confirmar contraseña (input)
- [x] Eliminar "Usuario"
- [x] Diseño moderno con gradiente y glassmorphism

### Página de Login:
- [x] Correo electrónico (input)
- [x] Contraseña (input)
- [x] Eliminar "Usuario"
- [x] Diseño moderno con gradiente y glassmorphism

### Página de Activación:
- [x] Mensaje: "Tu cuenta necesita ser activada"
- [x] Formulario para ingresar token de activación
- [x] Diseño moderno

---

## Fase 4: Middleware y Protección de Rutas ✅ COMPLETADO

- [x] Middleware verifica token JWT
- [x] Extrae companyId del token
- [x] Almacena companyId en headers para APIs (x-company-id, x-company-code)
- [x] Rutas protegidas solo accesibles con sesión activa
- [x] Rutas públicas: /login, /register, /activate y APIs de auth

---

## Fase 5: Sistema de Código de Empresa

- [ ] Generador de códigos únicos (INV-XXXXXX)
- [ ] Página para verificar código de empresa
- [ ] El código permite acceso directo al inventario de esa empresa

---

## Fase 6: Separación de Datos (Escalabilidad)

### Opción A - Esquemas por empresa (PostgreSQL):
- [ ] Crear función para obtener esquema dinámicamente
- [ ] Cada empresa = 1 esquema = sus propias tablas

### Opción B - Una BD con filtro:
- [ ] Todas las tablas tienen `companyId`
- [ ] Queries siempre filtran por companyId actual

---

## Notas Técnicas

- JWT_SECRET debe incluir companyId para identificar empresa
- El token de activación expira en 24-48 horas
- Correo de activación: usar servicio real (SendGrid, nodemailer) o simulador para desarrollo
