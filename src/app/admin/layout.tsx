"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Users, Flame, Wrench, Bell, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/extintores", label: "Extintores", icon: Flame },
  { href: "/admin/mantenciones", label: "Mantenciones", icon: Wrench },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name ?? session?.user?.email ?? "Admin";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F4EF" }}>
      <aside style={{
        width: "240px", background: "#fff",
        borderRight: "1px solid #EBEBEB",
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: "1.25rem",
          borderBottom: "1px solid #EBEBEB",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "34px", height: "34px", background: "#E24B4A",
            borderRadius: "9px", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
            boxShadow: "0 1px 4px rgba(226,75,74,0.35)",
          }}>
            <Flame size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a", letterSpacing: "-0.01em" }}>ExtintorPro</div>
            <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "1px" }}>Panel admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
                style={{
                  display: "flex", alignItems: "center", gap: "9px",
                  padding: "8px 11px", marginBottom: "2px",
                  fontSize: "13.5px", textDecoration: "none",
                  color: active ? "#1a1a1a" : "#777",
                  fontWeight: active ? "500" : "400",
                  borderRadius: "8px",
                  background: active ? "#F5F4EF" : "transparent",
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} color={active ? "#E24B4A" : "#aaa"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid #EBEBEB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 11px", marginBottom: "4px" }}>
            <div style={{
              width: "30px", height: "30px", background: "#1a1a1a",
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontSize: "11px",
              fontWeight: "600", flexShrink: 0, letterSpacing: "0.02em",
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {name}
              </div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Administrador</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-ghost"
            style={{
              width: "100%", padding: "7px 11px", borderRadius: "8px",
              border: "none", background: "transparent",
              fontSize: "13px", cursor: "pointer", color: "#777",
              display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            <LogOut size={13} color="#aaa" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
    </div>
  );
}
