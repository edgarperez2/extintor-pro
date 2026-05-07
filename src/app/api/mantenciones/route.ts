// src/app/api/mantenciones/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, EstadoMantencion } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// GET /api/mantenciones — listar mantenciones con filtros opcionales
export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const { searchParams } = new URL(req.url);
    const extintorId = searchParams.get("extintorId");
    const clienteId = searchParams.get("clienteId");
    const estado = searchParams.get("estado") as EstadoMantencion | null;

    const mantenciones = await prisma.mantencion.findMany({
      where: {
        ...(extintorId ? { extintorId } : {}),
        ...(estado ? { estado } : {}),
        ...(clienteId
          ? { extintor: { clienteId } }
          : {}),
      },
      include: {
        extintor: {
          include: {
            cliente: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: { proximaFecha: "asc" },
    });

    return NextResponse.json(mantenciones);
  } catch (error) {
    console.error("Error GET /api/mantenciones:", error);
    return NextResponse.json({ error: "Error al obtener mantenciones" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/mantenciones — registrar una mantención realizada
export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { extintorId, fecha, tecnico, observaciones, solicitudId } = body;

    if (!extintorId || !fecha) {
      return NextResponse.json(
        { error: "extintorId y fecha son obligatorios" },
        { status: 400 }
      );
    }

    // La próxima mantención es exactamente 1 año después
    const fechaMantencion = new Date(fecha);
    const proximaFecha = new Date(fechaMantencion);
    proximaFecha.setFullYear(proximaFecha.getFullYear() + 1);

    const mantencion = await prisma.mantencion.create({
      data: {
        extintorId,
        fecha: fechaMantencion,
        proximaFecha,
        tecnico,
        observaciones,
        estado: EstadoMantencion.COMPLETADA,
        ...(solicitudId ? { solicitudId } : {}),
      },
      include: {
        extintor: {
          include: {
            cliente: { select: { nombre: true, email: true } },
          },
        },
      },
    });

    // TODO (Paso 6): enviar email de confirmación al cliente con Resend

    return NextResponse.json(mantencion, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/mantenciones:", error);
    return NextResponse.json({ error: "Error al registrar mantención" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
