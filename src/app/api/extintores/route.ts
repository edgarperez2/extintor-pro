// src/app/api/extintores/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TipoExtintor } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// GET /api/extintores — listar todos los extintores (con filtro opcional por clienteId)
export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get("clienteId");

    const extintores = await prisma.extintor.findMany({
      where: {
        activo: true,
        ...(clienteId ? { clienteId } : {}),
      },
      include: {
        cliente: { select: { id: true, nombre: true } },
        mantenciones: {
          orderBy: { fecha: "desc" },
          take: 1,
        },
      },
      orderBy: { codigo: "asc" },
    });

    // Agregar estado calculado a cada extintor
    const extintoresConEstado = extintores.map((ext) => {
      const ultima = ext.mantenciones[0];
      if (!ultima) {
        return { ...ext, estado: "SIN_MANTENCION", diasRestantes: null };
      }
      const diasRestantes = Math.round(
        (new Date(ultima.proximaFecha).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
      let estado: string;
      if (diasRestantes < 0) estado = "VENCIDO";
      else if (diasRestantes <= 30) estado = "PROXIMO";
      else estado = "AL_DIA";

      return {
        ...ext,
        estado,
        diasRestantes,
        ultimaMantencion: ultima.fecha,
        proximaMantencion: ultima.proximaFecha,
      };
    });

    return NextResponse.json(extintoresConEstado);
  } catch (error) {
    console.error("Error GET /api/extintores:", error);
    return NextResponse.json({ error: "Error al obtener extintores" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/extintores — registrar nuevo extintor
export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { clienteId, tipo, capacidad, ubicacion } = body;

    if (!clienteId || !tipo || !capacidad || !ubicacion) {
      return NextResponse.json(
        { error: "clienteId, tipo, capacidad y ubicacion son obligatorios" },
        { status: 400 }
      );
    }

    // Generar código automático (EXT-XXXX)
    const ultimo = await prisma.extintor.findFirst({
      orderBy: { codigo: "desc" },
      select: { codigo: true },
    });

    let nuevoCodigo = "EXT-0001";
    if (ultimo) {
      const num = parseInt(ultimo.codigo.replace("EXT-", ""), 10);
      nuevoCodigo = `EXT-${String(num + 1).padStart(4, "0")}`;
    }

    const extintor = await prisma.extintor.create({
      data: {
        codigo: nuevoCodigo,
        tipo: tipo as TipoExtintor,
        capacidad,
        ubicacion,
        clienteId,
      },
    });

    return NextResponse.json(extintor, { status: 201 });
  } catch (error) {
    console.error("Error POST /api/extintores:", error);
    return NextResponse.json({ error: "Error al crear extintor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
