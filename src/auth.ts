import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

function getPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("authorize llamado:", credentials?.email);
        if (!credentials?.email || !credentials?.password) return null;

        const prisma = getPrisma();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        await prisma.$disconnect();

        console.log("usuario:", user?.email, "password:", user?.password ? "tiene" : "null");

        if (!user) return null;
        if (!user.password) return null;

        const ok = await bcrypt.compare(credentials.password as string, user.password);
        console.log("passwordOk:", ok);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role, clienteId: user.clienteId };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.clienteId = (user as any).clienteId;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.userId ?? token.sub;
        session.user.role = token.role as string;
        session.user.clienteId = token.clienteId as string | null;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
});