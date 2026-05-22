# ExtintorPro — Guía de construcción

## Stack
- **Framework**: Next.js 14 (App Router)
- **Base de datos**: Supabase (PostgreSQL) + Prisma ORM
- **Auth**: NextAuth.js v5
- **Emails**: Resend
- **Deploy**: Vercel

---

## Paso 1 — Instalar dependencias

```bash
npm install
```

---

## Paso 2 — Configurar Supabase

1. Crear proyecto en https://supabase.com
2. Ir a **Settings → Database → Connection string**
3. Copiar las URLs `Transaction` y `Session` en `.env`:

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

---

## Paso 3 — Ejecutar migraciones

```bash
# Crear las tablas en Supabase
npm run db:migrate

# Generar el cliente de Prisma
npm run db:generate

# Poblar con datos de prueba
npm run db:seed
```

---

## Paso 4 — Levantar en desarrollo

```bash
npm run dev
# → http://localhost:3000
```

---

## Paso 5 — Deploy en Vercel

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Conectar proyecto
vercel

# Agregar variables de entorno en Vercel Dashboard:
# DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, RESEND_API_KEY
```

---

## Estructura del proyecto

```
extintor-pro/
├── prisma/
│   ├── schema.prisma      ← Modelos de datos
│   └── seed.ts            ← Datos de prueba
├── src/
│   ├── app/
│   │   ├── (admin)/       ← Panel admin (protegido)
│   │   ├── (cliente)/     ← Portal cliente (protegido)
│   │   ├── api/           ← API Routes
│   │   │   ├── auth/      ← NextAuth
│   │   │   ├── clientes/
│   │   │   ├── extintores/
│   │   │   ├── mantenciones/
│   │   │   └── solicitudes/
│   │   └── ext/[codigo]/  ← Ficha pública QR (sin auth)
│   └── lib/
│       ├── prisma.ts          ← Cliente singleton
│       └── extintor-utils.ts  ← Lógica de negocio
├── .env.example
└── package.json
```

---

## Modelos de datos

| Modelo | Descripción |
|--------|-------------|
| `User` | Admin o usuario cliente con rol |
| `Cliente` | Empresa cliente con sus datos |
| `Extintor` | Extintor individual con código QR |
| `Mantencion` | Registro histórico de cada mantención |
| `Solicitud` | Solicitudes de mantención del cliente |

---

## Cuentas de prueba (después del seed)

| Rol | Email |
|-----|-------|
| Admin | admin@extintor.pro |
| Cliente | juan@aceros.cl |
| Cliente | bodega@clinica.cl |

> Los clientes usan **magic link** — recibirán un email para ingresar sin contraseña.

---
