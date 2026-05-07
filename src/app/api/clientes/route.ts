import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function GET() {
  const prisma = getPrisma();
  try {
    const clientes = await prisma.cliente.findMany({
      where: { activo: true },
      include: {
        extintores: {
          where: { activo: true },
          include: {
            mantenciones: {
              orderBy: { fecha: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    const clientesConEstado = clientes.map((cliente) => {
      const estados = cliente.extintores.map((ext) => {
        const ultima = ext.mantenciones[0];
        if (!ultima) return "SIN_MANTENCION";
        const dias = Math.round(
          (new Date(ultima.proximaFecha).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        );
        if (dias < 0) return "VENCIDO";
        if (dias <= 30) return "PROXIMO";
        return "AL_DIA";
      });

      const resumen = {
        total: cliente.extintores.length,
        vencidos: estados.filter((e) => e === "VENCIDO").length,
        proximos: estados.filter((e) => e === "PROXIMO").length,
        alDia: estados.filter((e) => e === "AL_DIA").length,
        sinMantencion: estados.filter((e) => e === "SIN_MANTENCION").length,
      };

      return { ...cliente, resumen };
    });

    return NextResponse.json(clientesConEstado);
  } catch (error) {
    console.error("Error GET /api/clientes:", error);
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { nombre, rut, direccion, telefono, email } = body;

    if (!nombre || !rut || !email) {
      return NextResponse.json(
        { error: "nombre, rut y email son obligatorios" },
        { status: 400 },
      );
    }

    const cliente = await prisma.cliente.create({
      data: { nombre, rut, direccion, telefono, email },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "El RUT ya está registrado" },
        { status: 409 },
      );
    }
    console.error("Error POST /api/clientes:", error);
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
