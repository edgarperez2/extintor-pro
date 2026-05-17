export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function GET(_req: NextRequest, { params }: { params: { codigo: string } }) {
  const prisma = getPrisma();
  try {
    const extintor = await prisma.extintor.findFirst({
      where: { codigo: params.codigo, activo: true },
      include: {
        cliente: { select: { nombre: true, rut: true, email: true, telefono: true } },
        mantenciones: { orderBy: { fecha: "desc" }, take: 10 },
      },
    });
    if (!extintor) return NextResponse.json({ error: "Extintor no encontrado" }, { status: 404 });
    const ultima = extintor.mantenciones[0];
    let estado = "SIN_MANTENCION";
    let diasRestantes: number | null = null;
    if (ultima) {
      diasRestantes = Math.round((new Date(ultima.proximaFecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (diasRestantes < 0) estado = "VENCIDO";
      else if (diasRestantes <= 30) estado = "PROXIMO";
      else estado = "AL_DIA";
    }
    return NextResponse.json({ ...extintor, estado, diasRestantes });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener extintor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}