// src/app/api/extintores/codigo/[codigo]/route.ts
// Ruta PÚBLICA — no requiere autenticación
// Es la que se llama al escanear el QR del extintor

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
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
          take: 5, // últimas 5 mantenciones para el historial
        },
      },
    });

    if (!extintor || !extintor.activo) {
      return NextResponse.json({ error: "Extintor no encontrado" }, { status: 404 });
    }

    // Calcular estado
    const ultima = extintor.mantenciones[0];
    let estado = "SIN_MANTENCION";
    let diasRestantes = null;
    let ultimaMantencion = null;
    let proximaMantencion = null;

    if (ultima) {
      const diff = Math.round(
        (new Date(ultima.proximaFecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      diasRestantes = diff;
      ultimaMantencion = ultima.fecha;
      proximaMantencion = ultima.proximaFecha;

      if (diff < 0) estado = "VENCIDO";
      else if (diff <= 30) estado = "PROXIMO";
      else estado = "AL_DIA";
    }

    // Respuesta pública — solo datos necesarios, sin info sensible
    return NextResponse.json({
      codigo: extintor.codigo,
      tipo: extintor.tipo,
      capacidad: extintor.capacidad,
      ubicacion: extintor.ubicacion,
      cliente: extintor.cliente.nombre,
      estado,
      diasRestantes,
      ultimaMantencion,
      proximaMantencion,
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
