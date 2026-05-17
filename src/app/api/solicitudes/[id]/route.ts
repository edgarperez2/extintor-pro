export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, EstadoSolicitud, EstadoMantencion } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: params.id },
      include: { cliente: true, mantenciones: { include: { extintor: true } } },
    });
    if (!solicitud) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    return NextResponse.json(solicitud);
  } catch {
    return NextResponse.json({ error: "Error al obtener solicitud" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { estado, fecha, tecnico, observaciones } = body;

    if (!estado || !Object.values(EstadoSolicitud).includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const solicitud = await prisma.solicitud.findUnique({ where: { id: params.id } });
    if (!solicitud) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });

    // Si se acepta con fecha y técnico, crear las mantenciones
    if (estado === "ACEPTADA" && fecha && solicitud.extintoresIds.length > 0) {
      const fechaMantencion = new Date(fecha);
      const proximaFecha = new Date(fechaMantencion);
      proximaFecha.setFullYear(proximaFecha.getFullYear() + 1);

      await prisma.$transaction(async (tx) => {
        await tx.solicitud.update({ where: { id: params.id }, data: { estado } });
        await Promise.all(
          solicitud.extintoresIds.map((extintorId) =>
            tx.mantencion.create({
              data: {
                extintorId,
                fecha: fechaMantencion,
                proximaFecha,
                tecnico: tecnico || null,
                observaciones: observaciones || null,
                estado: EstadoMantencion.COMPLETADA,
                solicitudId: params.id,
              },
            })
          )
        );
      });

      return NextResponse.json({ ok: true });
    }

    const actualizada = await prisma.solicitud.update({
      where: { id: params.id },
      data: { estado: estado as EstadoSolicitud },
      include: { cliente: { select: { nombre: true, email: true } } },
    });

    return NextResponse.json(actualizada);
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    return NextResponse.json({ error: "Error al actualizar solicitud" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
