export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { nombre, rut, email, telefono, direccion, password } = body;

    if (!nombre || !rut || !email || !password) {
      return NextResponse.json({ error: "nombre, rut, email y contraseña son obligatorios" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);

    const resultado = await prisma.$transaction(async (tx) => {
      const clienteExistente = await tx.cliente.findFirst({ where: { rut } });
      if (clienteExistente) throw Object.assign(new Error("RUT ya registrado"), { code: "RUT_EXISTS" });

      const cliente = await tx.cliente.create({
        data: { nombre, rut, direccion: direccion || null, telefono: telefono || null, email },
      });

      const userExistente = await tx.user.findUnique({ where: { email } });
      if (!userExistente) {
        await tx.user.create({
          data: { email, name: nombre, password: hash, role: "CLIENTE", clienteId: cliente.id },
        });
      } else {
        await tx.user.update({ where: { email }, data: { password: hash, clienteId: cliente.id, role: "CLIENTE" } });
      }

      return cliente;
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    if (error.code === "RUT_EXISTS") return NextResponse.json({ error: "El RUT ya está registrado" }, { status: 409 });
    if (error.code === "P2002") return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}