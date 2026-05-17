export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: params.id },
      include: {
        extintores: {
          where: { activo: true },
          include: { mantenciones: { orderBy: { fecha: "desc" }, take: 1 } },
          orderBy: { codigo: "asc" },
        },
      },
    });
    if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { nombre, rut, email, telefono, direccion } = body;
    if (!nombre || !rut || !email) {
      return NextResponse.json({ error: "nombre, rut y email son obligatorios" }, { status: 400 });
    }
    const cliente = await prisma.cliente.update({
      where: { id: params.id },
      data: { nombre, rut, email, telefono: telefono || null, direccion: direccion || null },
    });
    return NextResponse.json(cliente);
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    if (error.code === "P2002") return NextResponse.json({ error: "El RUT o email ya está registrado" }, { status: 409 });
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    await prisma.cliente.update({ where: { id: params.id }, data: { activo: false } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}