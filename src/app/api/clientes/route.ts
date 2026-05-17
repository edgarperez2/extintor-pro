export const dynamic = "force-dynamic";
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
          include: { mantenciones: { orderBy: { fecha: "desc" }, take: 1 } },
        },
      },
      orderBy: { nombre: "asc" },
    });

    const clientesConEstado = clientes.map((cliente) => {
      const estados = cliente.extintores.map((ext) => {
        const ultima = ext.mantenciones[0];
        if (!ultima) return "SIN_MANTENCION";
        const dias = Math.round((new Date(ultima.proximaFecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (dias < 0) return "VENCIDO";
        if (dias <= 30) return "PROXIMO";
        return "AL_DIA";
      });
      return {
        ...cliente,
        resumen: {
          total: cliente.extintores.length,
          vencidos: estados.filter((e) => e === "VENCIDO").length,
          proximos: estados.filter((e) => e === "PROXIMO").length,
          alDia: estados.filter((e) => e === "AL_DIA").length,
          sinMantencion: estados.filter((e) => e === "SIN_MANTENCION").length,
        },
      };
    });

    return NextResponse.json(clientesConEstado);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { nombre, rut, direccion, telefono, email, crearUsuario } = body;

    if (!nombre || !rut || !email) {
      return NextResponse.json({ error: "nombre, rut y email son obligatorios" }, { status: 400 });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.create({
        data: { nombre, rut, direccion, telefono, email },
      });

      if (crearUsuario) {
        const userExistente = await tx.user.findUnique({ where: { email } });
        if (!userExistente) {
          await tx.user.create({
            data: { email, name: nombre, role: "CLIENTE", clienteId: cliente.id },
          });
        }
      }

      return cliente;
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "El RUT o email ya está registrado" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
