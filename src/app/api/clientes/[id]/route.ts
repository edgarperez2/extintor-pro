// src/app/api/clientes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// GET /api/clientes/[id] — detalle de un cliente con todos sus extintores
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: params.id },
      include: {
        extintores: {
          where: { activo: true },
          include: {
            mantenciones: {
              orderBy: { fecha: "desc" },
            },
          },
        },
        solicitudes: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Error GET /api/clientes/[id]:", error);
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/clientes/[id] — editar datos del cliente
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { nombre, rut, direccion, telefono, email } = body;

    const cliente = await prisma.cliente.update({
      where: { id: params.id },
      data: { nombre, rut, direccion, telefono, email },
    });

    return NextResponse.json(cliente);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    console.error("Error PUT /api/clientes/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/clientes/[id] — desactivar cliente (soft delete)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    await prisma.cliente.update({
      where: { id: params.id },
      data: { activo: false },
    });

    return NextResponse.json({ message: "Cliente desactivado correctamente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    console.error("Error DELETE /api/clientes/[id]:", error);
    return NextResponse.json({ error: "Error al desactivar cliente" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
