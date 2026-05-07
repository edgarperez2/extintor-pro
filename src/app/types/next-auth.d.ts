// src/types/next-auth.d.ts
// Extiende los tipos de NextAuth para incluir role y clienteId

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      clienteId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    clienteId: string | null;
    password?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    clienteId: string | null;
  }
}
