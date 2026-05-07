// src/app/api/solicitudes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, EstadoSolicitud } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// GET /api/solicitudes/[id] — detalle de una solicitud
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        mantenciones: {
          include: { extintor: true },
        },
      },
    });

    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    return NextResponse.json(solicitud);
  } catch (error) {
    console.error("Error GET /api/solicitudes/[id]:", error);
    return NextResponse.json({ error: "Error al obtener solicitud" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/solicitudes/[id] — admin actualiza estado (ACEPTADA, RECHAZADA, COMPLETADA)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { estado } = body;

    if (!estado || !Object.values(EstadoSolicitud).includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const solicitud = await prisma.solicitud.update({
      where: { id: params.id },
      data: { estado: estado as EstadoSolicitud },
      include: {
        cliente: { select: { nombre: true, email: true } },
      },
    });

    // TODO (Paso 6): notificar al cliente por email con Resend según el estado

    return NextResponse.json(solicitud);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }
    console.error("Error PUT /api/solicitudes/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar solicitud" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
