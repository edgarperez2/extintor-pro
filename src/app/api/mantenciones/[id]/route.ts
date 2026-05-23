export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const { fecha, proximaFecha, tecnico, observaciones, estado } = await req.json();
    const data: any = {};
    if (fecha) data.fecha = new Date(fecha);
    if (proximaFecha) data.proximaFecha = new Date(proximaFecha);
    if (tecnico !== undefined) data.tecnico = tecnico;
    if (observaciones !== undefined) data.observaciones = observaciones;
    if (estado) data.estado = estado;

    const mantencion = await prisma.mantencion.update({
      where: { id: params.id },
      data,
      include: { extintor: { include: { cliente: true } } },
    });
    return NextResponse.json(mantencion);
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Mantención no encontrada" }, { status: 404 });
    return NextResponse.json({ error: "Error al actualizar mantención" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    await prisma.mantencion.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Mantención no encontrada" }, { status: 404 });
    return NextResponse.json({ error: "Error al eliminar mantención" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
