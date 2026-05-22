export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    const { password, role } = await req.json();
    const data: any = {};
    if (password) {
      if (password.length < 6) return NextResponse.json({ error: "La contrasena debe tener al menos 6 caracteres" }, { status: 400 });
      data.password = await bcrypt.hash(password, 12);
    }
    if (role) data.role = role;
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });

    const usuario = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(usuario);
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = getPrisma();
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
