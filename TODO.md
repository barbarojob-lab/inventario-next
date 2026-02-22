# Plan de Implementación - Sistema de 3 Ventanas

## Objetivo
Simplificar el sistema de autenticación sin necesidad de email:
1. **Crear Empresa** - Admin crea empresa y obtiene token
2. **Registro** - Empleados se registran con el token
3. **Login** - Acceso normal

## Tareas completadas:

### 1. API Register (src/app/api/auth/register/route.ts)
- [x] Cambiar para que acepte un `companyCode` en el registro
- [x] Si viene `companyCode`, verificar que la empresa existe y vincular al empleado
- [x] Si NO viene `companyCode`, crear nueva empresa (comportamiento actual)

### 2. Página "Crear Empresa" (src/app/create-company/page.tsx)
- [x] Nueva página para que el admin cree su empresa
- [x] Muestra el código generado después del registro

### 3. Página Registro (src/app/register/page.tsx)
- [x] Agregar campo para ingresar "Token de Empresa"
- [x] Validar que el token exista antes de registrar
- [x] Enviar companyCode al API

### 4. Login (mantener igual)
- Ya funciona correctamente con email + contraseña

---

## Flujo implementado:
1. Admin va a /createCompany → crea empresa → ve su código INV-XYZ123
2. Empleado va a /register → ingresa sus datos + código INV-XYZ123 → se vincula a esa empresa  
3. Ambos acceden desde /login con email + contraseña

Ambos acceden normalmente desde /login usando su correo electrónico y contraseña.
