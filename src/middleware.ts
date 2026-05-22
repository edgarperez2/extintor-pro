import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicPaths = ["/login", "/registro", "/ext/", "/api/auth", "/api/extintores/codigo", "/api/registro", "/api/setup"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string;

  // Solo ADMIN y OPERADOR pueden entrar al panel admin
  if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "OPERADOR") {
    return NextResponse.redirect(new URL("/cliente", req.url));
  }

  // Solo ADMIN puede gestionar usuarios
  if (pathname.startsWith("/admin/usuarios") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname.startsWith("/cliente") && role !== "CLIENTE") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};