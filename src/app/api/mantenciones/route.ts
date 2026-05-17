export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, EstadoMantencion } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function GET() {
  const prisma = getPrisma();
  try {
    const mantenciones = await prisma.mantencion.findMany({
      include: {
        extintor: {
          include: { cliente: { select: { nombre: true } } },
        },
      },
      orderBy: { fecha: "desc" },
    });
    return NextResponse.json(mantenciones);
  } catch {
    return NextResponse.json({ error: "Error al obtener mantenciones" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { extintorId, fecha, tecnico, observaciones } = body;

    if (!extintorId || !fecha) {
      return NextResponse.json({ error: "extintorId y fecha son obligatorios" }, { status: 400 });
    }

    const fechaMantencion = new Date(fecha);
    const proximaFecha = new Date(fechaMantencion);
    proximaFecha.setFullYear(proximaFecha.getFullYear() + 1);

    const mantencion = await prisma.mantencion.create({
      data: {
        extintorId,
        fecha: fechaMantencion,
        proximaFecha,
        tecnico: tecnico || null,
        observaciones: observaciones || null,
        estado: EstadoMantencion.COMPLETADA,
      },
      include: {
        extintor: { include: { cliente: { select: { nombre: true } } } },
      },
    });

    return NextResponse.json(mantencion, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Extintor no encontrado" }, { status: 404 });
    return NextResponse.json({ error: "Error al registrar mantención" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}