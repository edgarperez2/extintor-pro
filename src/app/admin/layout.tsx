// src/app/admin/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/clientes", label: "Clientes", icon: "◉" },
  { href: "/admin/extintores", label: "Extintores", icon: "⬡" },
  { href: "/admin/mantenciones", label: "Mantenciones", icon: "⌛" },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: "✉" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", background: "#F5F4EF" }}>
      <div style={{ width: "200px", background: "#fff", borderRight: "0.5px solid #E5E4DC", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid #E5E4DC", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", background: "#E24B4A", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "600" }}>EX</div>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>ExtintorPro</span>
        </div>
        <nav style={{ flex: 1, padding: "0.75rem 0" }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 1.25rem", fontSize: "13px", textDecoration: "none", color: active ? "#1a1a1a" : "#666", fontWeight: active ? "500" : "400", borderLeft: active ? "2px solid #E24B4A" : "2px solid transparent", background: active ? "#F5F4EF" : "transparent" }}>
                <span style={{ width: "16px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "1rem 1.25rem", borderTop: "0.5px solid #E5E4DC" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>Administrador</div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "0.5px solid #E5E4DC", background: "transparent", fontSize: "12px", cursor: "pointer", color: "#666" }}>
            Cerrar sesión
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}
