// src/app/api/dashboard/route.ts
// Métricas generales para el panel admin
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function GET() {
  const prisma = getPrisma();
  try {
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    // Consultas en paralelo para mejor performance
    const [
      totalClientes,
      totalExtintores,
      solicitudesPendientes,
      ultimasMantenciones,
    ] = await Promise.all([
      prisma.cliente.count({ where: { activo: true } }),
      prisma.extintor.count({ where: { activo: true } }),
      prisma.solicitud.count({ where: { estado: "PENDIENTE" } }),
      // Última mantención por extintor para calcular estados
      prisma.extintor.findMany({
        where: { activo: true },
        select: {
          id: true,
          codigo: true,
          ubicacion: true,
          cliente: { select: { nombre: true } },
          mantenciones: {
            orderBy: { fecha: "desc" },
            take: 1,
            select: { proximaFecha: true, fecha: true, tecnico: true },
          },
        },
      }),
    ]);

    // Calcular estados de todos los extintores
    let vencidos = 0;
    let proximosAVencer = 0;
    let alDia = 0;
    let sinMantencion = 0;
    const proximasMantenciones: any[] = [];

    for (const ext of ultimasMantenciones) {
      const ultima = ext.mantenciones[0];
      if (!ultima) {
        sinMantencion++;
        continue;
      }
      const dias = Math.round(
        (new Date(ultima.proximaFecha).getTime() - hoy.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (dias < 0) {
        vencidos++;
        proximasMantenciones.push({ ...ext, dias, estado: "VENCIDO" });
      } else if (dias <= 30) {
        proximosAVencer++;
        proximasMantenciones.push({ ...ext, dias, estado: "PROXIMO" });
      } else {
        alDia++;
      }
    }

    // Ordenar por más urgente primero
    proximasMantenciones.sort((a, b) => a.dias - b.dias);

    return NextResponse.json({
      resumen: {
        totalClientes,
        totalExtintores,
        solicitudesPendientes,
        vencidos,
        proximosAVencer,
        alDia,
        sinMantencion,
      },
      proximasMantenciones: proximasMantenciones.slice(0, 10), // top 10
    });
  } catch (error) {
    console.error("Error GET /api/dashboard:", error);
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
