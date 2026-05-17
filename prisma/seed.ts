import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = "admin@extintor.pro";
  const password = "Admin123!";
  const hash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Update password in case it was null
    await prisma.user.update({ where: { email }, data: { password: hash, role: "ADMIN" } });
    console.log("Admin actualizado:", email);
  } else {
    await prisma.user.create({
      data: { email, name: "Administrador", password: hash, role: "ADMIN" },
    });
    console.log("Admin creado:", email);
  }

  console.log("Contrasena: Admin123!");
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });