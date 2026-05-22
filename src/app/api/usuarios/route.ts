export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function GET() {
  const prisma = getPrisma();
  try {
    const usuarios = await prisma.user.findMany({
      where: { role: { in: [Role.ADMIN, Role.OPERADOR] } },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(usuarios);
  } catch (e) {
    console.error("GET /api/usuarios error:", e);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "nombre, email y contrasena son obligatorios" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contrasena debe tener al menos 6 caracteres" }, { status: 400 });
    }
    const rolAsignado: Role = role === "OPERADOR" ? Role.OPERADOR : Role.ADMIN;
    const hash = await bcrypt.hash(password, 12);
    const usuario = await prisma.user.create({
      data: { name, email, password: hash, role: rolAsignado },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(usuario, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ error: "El email ya esta registrado" }, { status: 409 });
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
