export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TipoExtintor } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { tipo, capacidad, ubicacion, clienteId } = body;

    if (!tipo || !capacidad || !ubicacion || !clienteId) {
      return NextResponse.json({ error: "tipo, capacidad, ubicacion y clienteId son obligatorios" }, { status: 400 });
    }

    const extintor = await prisma.extintor.update({
      where: { id: params.id },
      data: { tipo: tipo as TipoExtintor, capacidad, ubicacion, clienteId },
      include: { cliente: { select: { id: true, nombre: true } } },
    });

    return NextResponse.json(extintor);
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Extintor no encontrado" }, { status: 404 });
    return NextResponse.json({ error: "Error al actualizar extintor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    await prisma.extintor.update({ where: { id: params.id }, data: { activo: false } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Extintor no encontrado" }, { status: 404 });
    return NextResponse.json({ error: "Error al eliminar extintor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}