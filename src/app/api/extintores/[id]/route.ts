// src/app/api/extintores/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TipoExtintor } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// GET /api/extintores/[id] — detalle del extintor con historial completo
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const extintor = await prisma.extintor.findUnique({
      where: { id: params.id },
      include: {
        cliente: { select: { id: true, nombre: true, email: true } },
        mantenciones: { orderBy: { fecha: "desc" } },
      },
    });

    if (!extintor) {
      return NextResponse.json({ error: "Extintor no encontrado" }, { status: 404 });
    }

    // Calcular estado
    const ultima = extintor.mantenciones[0];
    let estado = "SIN_MANTENCION";
    let diasRestantes = null;

    if (ultima) {
      const diff = Math.round(
        (new Date(ultima.proximaFecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      diasRestantes = diff;
      if (diff < 0) estado = "VENCIDO";
      else if (diff <= 30) estado = "PROXIMO";
      else estado = "AL_DIA";
    }

    return NextResponse.json({ ...extintor, estado, diasRestantes });
  } catch (error) {
    console.error("Error GET /api/extintores/[id]:", error);
    return NextResponse.json({ error: "Error al obtener extintor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/extintores/codigo/[codigo] — buscar por código QR
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { tipo, capacidad, ubicacion } = body;

    const extintor = await prisma.extintor.update({
      where: { id: params.id },
      data: {
        ...(tipo ? { tipo: tipo as TipoExtintor } : {}),
        ...(capacidad ? { capacidad } : {}),
        ...(ubicacion ? { ubicacion } : {}),
      },
    });

    return NextResponse.json(extintor);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Extintor no encontrado" }, { status: 404 });
    }
    console.error("Error PUT /api/extintores/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar extintor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/extintores/[id] — desactivar extintor (soft delete)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    await prisma.extintor.update({
      where: { id: params.id },
      data: { activo: false },
    });

    return NextResponse.json({ message: "Extintor desactivado correctamente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Extintor no encontrado" }, { status: 404 });
    }
    console.error("Error DELETE /api/extintores/[id]:", error);
    return NextResponse.json({ error: "Error al desactivar extintor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
