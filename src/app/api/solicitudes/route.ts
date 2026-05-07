// src/app/api/solicitudes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, EstadoSolicitud } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// GET /api/solicitudes — listar solicitudes (filtro por clienteId o estado)
export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get("clienteId");
    const estado = searchParams.get("estado") as EstadoSolicitud | null;

    const solicitudes = await prisma.solicitud.findMany({
      where: {
        ...(clienteId ? { clienteId } : {}),
        ...(estado ? { estado } : {}),
      },
      include: {
        cliente: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(solicitudes);
  } catch (error) {
    console.error("Error GET /api/solicitudes:", error);
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/solicitudes — cliente crea una solicitud de mantención
export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { clienteId, extintoresIds, fechaSolicitada, observaciones } = body;

    if (!clienteId || !extintoresIds?.length) {
      return NextResponse.json(
        { error: "clienteId y al menos un extintor son obligatorios" },
        { status: 400 }
      );
    }

    const solicitud = await prisma.solicitud.create({
      data: {
        clienteId,
        extintoresIds,
        fechaSolicitada: fechaSolicitada ? new Date(fechaSolicitada) : null,
        observaciones,
        estado: EstadoSolicitud.PENDIENTE,
      },
      include: {
        cliente: { select: { nombre: true, email: true } },
      },
    });

    // TODO (Paso 6): notificar al admin por email con Resend

    return NextResponse.json(solicitud, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/solicitudes:", error);
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
