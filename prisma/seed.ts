// prisma/seed.ts
// Ejecutar con: npx prisma db seed

import { PrismaClient, TipoExtintor, EstadoMantencion } from "@prisma/client";
import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── Admin ──────────────────────────────────────────────────────────────
  import bcrypt from "bcryptjs";

const adminPassword = await bcrypt.hash("admin1234", 10);

const admin = await prisma.user.upsert({
  where: { email: "admin@extintor.pro" },
  update: {},
  create: {
    email: "admin@extintor.pro",
    name: "Administrador",
    role: "ADMIN",
    password: adminPassword,
  },
});
  console.log("✅ Admin creado:", admin.email);

  // ── Cliente 1: Aceros del Sur ─────────────────────────────────────────
  const aceros = await prisma.cliente.upsert({
    where: { rut: "76.123.456-7" },
    update: {},
    create: {
      nombre: "Aceros del Sur",
      rut: "76.123.456-7",
      direccion: "Av. Industrial 432, Talca",
      telefono: "+56 9 8765 4321",
      email: "juan@aceros.cl",
    },
  });

  // Usuario cliente vinculado
  await prisma.user.upsert({
    where: { email: "juan@aceros.cl" },
    update: {},
    create: {
      email: "juan@aceros.cl",
      name: "Juan Pérez",
      role: "CLIENTE",
      clienteId: aceros.id,
    },
  });

  // Extintores de Aceros del Sur
  const extintoresAceros = await Promise.all([
    prisma.extintor.upsert({
      where: { codigo: "EXT-0041" },
      update: {},
      create: {
        codigo: "EXT-0041",
        tipo: TipoExtintor.CO2,
        capacidad: "5 kg",
        ubicacion: "Bodega principal",
        clienteId: aceros.id,
      },
    }),
    prisma.extintor.upsert({
      where: { codigo: "EXT-0042" },
      update: {},
      create: {
        codigo: "EXT-0042",
        tipo: TipoExtintor.PQS,
        capacidad: "6 kg",
        ubicacion: "Entrada",
        clienteId: aceros.id,
      },
    }),
    prisma.extintor.upsert({
      where: { codigo: "EXT-0043" },
      update: {},
      create: {
        codigo: "EXT-0043",
        tipo: TipoExtintor.AGUA,
        capacidad: "9 L",
        ubicacion: "Oficinas",
        clienteId: aceros.id,
      },
    }),
  ]);

  // Mantenciones para EXT-0041 (vencido — hace 1 año)
  const hoy = new Date();
  const haceUnAno = new Date(hoy);
  haceUnAno.setFullYear(hoy.getFullYear() - 1);
  const hace2Anos = new Date(hoy);
  hace2Anos.setFullYear(hoy.getFullYear() - 2);

  await prisma.mantencion.create({
    data: {
      fecha: hace2Anos,
      proximaFecha: haceUnAno,
      tecnico: "M. Soto",
      estado: EstadoMantencion.COMPLETADA,
      extintorId: extintoresAceros[0].id,
    },
  });

  await prisma.mantencion.create({
    data: {
      fecha: haceUnAno,
      proximaFecha: hoy, // vencida hoy
      tecnico: "C. Rojas",
      estado: EstadoMantencion.COMPLETADA,
      extintorId: extintoresAceros[0].id,
    },
  });

  // ── Cliente 2: Clínica Los Pinos ──────────────────────────────────────
  const clinica = await prisma.cliente.upsert({
    where: { rut: "76.345.678-9" },
    update: {},
    create: {
      nombre: "Clínica Los Pinos",
      rut: "76.345.678-9",
      direccion: "Calle Salud 210, Talca",
      telefono: "+56 9 7654 3210",
      email: "bodega@clinica.cl",
    },
  });

  await prisma.user.upsert({
    where: { email: "bodega@clinica.cl" },
    update: {},
    create: {
      email: "bodega@clinica.cl",
      name: "Bodega Clínica",
      role: "CLIENTE",
      clienteId: clinica.id,
    },
  });

  console.log("✅ Clientes y extintores creados");
  console.log("\n📋 Cuentas de prueba:");
  console.log("   Admin:   admin@extintor.pro");
  console.log("   Cliente: juan@aceros.cl  (magic link)");
  console.log("   Cliente: bodega@clinica.cl (magic link)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
