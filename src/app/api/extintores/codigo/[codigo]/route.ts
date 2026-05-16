export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function getPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { codigo: string } }
) {
  const prisma = getPrisma();
  try {
    const extintor = await prisma.extintor.findUnique({
      where: { codigo: params.codigo.toUpperCase() },
      include: {
        cliente: { select: { nombre: true, direccion: true } },
        mantenciones: {
          orderBy: { fecha: "desc" },
          take: 5,
        },
      },
    });

    if (!extintor || !extintor.activo) {
      return NextResponse.json({ error: "Extintor no encontrado" }, { status: 404 });
    }

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

    return NextResponse.json({
      codigo: extintor.codigo,
      tipo: extintor.tipo,
      capacidad: extintor.capacidad,
      ubicacion: extintor.ubicacion,
      cliente: extintor.cliente.nombre,
      estado,
      diasRestantes,
      ultimaMantencion: ultima?.fecha ?? null,
      proximaMantencion: ultima?.proximaFecha ?? null,
      historial: extintor.mantenciones.map((m) => ({
        fecha: m.fecha,
        tecnico: m.tecnico,
        estado: m.estado,
      })),
    });
  } catch (error) {
    console.error("Error GET /api/extintores/codigo/[codigo]:", error);
    return NextResponse.json({ error: "Error al obtener extintor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
