"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Users, Flame, Wrench, Bell, LogOut, ScanLine, UserCog, KeyRound, Eye, EyeOff, X } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/extintores", label: "Extintores", icon: Flame },
  { href: "/admin/mantenciones", label: "Mantenciones", icon: Wrench },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Bell },
  { href: "/admin/scanner", label: "Escanear QR", icon: ScanLine },
];

const adminOnlyItems = [
  { href: "/admin/usuarios", label: "Usuarios", icon: UserCog },
];

/* ─── Modal cambiar contraseña propia ──────────────────────────────────── */
function CambiarPasswordModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setError("Ingresa una contraseña"); return; }
    if (password.length < 6) { setError("Mínimo 6 caracteres"); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/usuarios/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); setSaving(false); return; }
      setOk(true);
      setTimeout(() => onClose(), 1500);
    } catch { setError("Error de conexión"); setSaving(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: "8px",
    border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #1a1a1a, #333)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>Mi contraseña</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}
          {ok && <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#166534" }}>✓ Contraseña actualizada</div>}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Nueva contraseña *</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} style={{ ...inputStyle, paddingRight: "44px" }} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoFocus />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", color: "#888" }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Confirmar contraseña *</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirm ? "text" : "password"} style={{ ...inputStyle, paddingRight: "44px" }} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" />
              <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", color: "#888" }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button type="submit" disabled={saving || ok} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #1a1a1a, #333)", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Layout principal ──────────────────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showPassModal, setShowPassModal] = useState(false);

  const name = session?.user?.name ?? session?.user?.email ?? "Admin";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const role = (session?.user as any)?.role as string;
  const userId = (session?.user as any)?.id as string;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F4EF" }}>
      {showPassModal && userId && (
        <CambiarPasswordModal userId={userId} onClose={() => setShowPassModal(false)} />
      )}

      <aside style={{ width: "240px", background: "#fff", borderRight: "1px solid #EBEBEB", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "1.25rem", borderBottom: "1px solid #EBEBEB", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", background: "#E24B4A", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 4px rgba(226,75,74,0.35)" }}>
            <Flame size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a", letterSpacing: "-0.01em" }}>ExtintorPro</div>
            <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "1px" }}>Panel admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {[...navItems, ...(role === "ADMIN" ? adminOnlyItems : [])].map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="nav-link" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 11px", marginBottom: "2px", fontSize: "13.5px", textDecoration: "none", color: active ? "#1a1a1a" : "#777", fontWeight: active ? "500" : "400", borderRadius: "8px", background: active ? "#F5F4EF" : "transparent" }}>
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} color={active ? "#E24B4A" : "#aaa"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid #EBEBEB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 11px", marginBottom: "2px" }}>
            <div style={{ width: "30px", height: "30px", background: "#1a1a1a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "600", flexShrink: 0, letterSpacing: "0.02em" }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>{role === "ADMIN" ? "Administrador" : "Operador"}</div>
            </div>
          </div>
          <button
            onClick={() => setShowPassModal(true)}
            style={{ width: "100%", padding: "7px 11px", borderRadius: "8px", border: "none", background: "transparent", fontSize: "13px", cursor: "pointer", color: "#777", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <KeyRound size={13} color="#aaa" />
            Cambiar contraseña
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-ghost"
            style={{ width: "100%", padding: "7px 11px", borderRadius: "8px", border: "none", background: "transparent", fontSize: "13px", cursor: "pointer", color: "#777", display: "flex", alignItems: "center", gap: "8px" }}
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
