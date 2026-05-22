"use client";
import { useEffect, useState } from "react";
import { UserPlus, Trash2, X, ShieldCheck, KeyRound, Eye, EyeOff, Shield, Wrench } from "lucide-react";

interface Usuario { id: string; name: string | null; email: string; role: string; createdAt: string; }

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

const ROL_INFO: Record<string, { label: string; desc: string; bg: string; color: string; border: string }> = {
  ADMIN: {
    label: "Administrador",
    desc: "Acceso total: clientes, extintores, mantenciones, solicitudes, escáner QR y gestión de usuarios.",
    bg: "#EEF2FF", color: "#3730A3", border: "#C7D2FE",
  },
  OPERADOR: {
    label: "Operador",
    desc: "Puede crear y editar clientes, extintores, ver mantenciones, aprobar solicitudes y escanear QR. No puede gestionar usuarios.",
    bg: "#F0FDF4", color: "#166534", border: "#BBF7D0",
  },
};

/* ─── Modal: Crear usuario ──────────────────────────────────────────────────── */
function NuevoUsuarioModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: Usuario) => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "OPERADOR" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Todos los campos son obligatorios"); return; }
    if (form.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); setSaving(false); return; }
      onCreated(data); onClose();
    } catch { setError("Error de conexion"); setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #E24B4A, #B22020)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>Nuevo usuario</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Nombre completo *</label>
            <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Juan Perez" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Email *</label>
            <input type="email" style={inputStyle} value={form.email} onChange={e => set("email", e.target.value)} placeholder="usuario@extintor.pro" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Contraseña *</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "44px" }}
                value={form.password}
                onChange={e => set("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", color: "#888" }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Rol */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "8px" }}>Rol *</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(["OPERADOR", "ADMIN"] as const).map(rol => {
                const info = ROL_INFO[rol];
                const selected = form.role === rol;
                return (
                  <label key={rol} style={{ display: "flex", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${selected ? info.border : "#E5E4DC"}`, background: selected ? info.bg : "#fff", cursor: "pointer", alignItems: "flex-start" }}>
                    <input
                      type="radio"
                      name="role"
                      value={rol}
                      checked={selected}
                      onChange={() => set("role", rol)}
                      style={{ marginTop: "2px", accentColor: info.color }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: info.color }}>{info.label}</div>
                      <div style={{ fontSize: "11.5px", color: "#666", marginTop: "2px", lineHeight: "1.4" }}>{info.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Modal: Cambiar contraseña ─────────────────────────────────────────────── */
function CambiarPasswordModal({ usuario, onClose, onUpdated }: { usuario: Usuario; onClose: () => void; onUpdated: (u: Usuario) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setError("Ingresa una contraseña"); return; }
    if (password.length < 6) { setError("Mínimo 6 caracteres"); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); setSaving(false); return; }
      setSuccess(true);
      onUpdated(data);
      setTimeout(() => onClose(), 1200);
    } catch { setError("Error de conexion"); setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #1a1a1a, #333)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>Cambiar contraseña</div>
            <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{usuario.name || usuario.email}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}
          {success && <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#166534" }}>Contraseña actualizada correctamente</div>}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Nueva contraseña *</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "44px" }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoFocus
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", color: "#888" }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Confirmar contraseña *</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "44px" }}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", color: "#888" }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button type="submit" disabled={saving || success} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #1a1a1a, #333)", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Página principal ──────────────────────────────────────────────────────── */
export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"nuevo" | null>(null);
  const [passwordUsuario, setPasswordUsuario] = useState<Usuario | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usuarios")
      .then(r => r.json())
      .then(data => { setUsuarios(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    setEliminando(id);
    await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    setUsuarios(prev => prev.filter(u => u.id !== id));
    setEliminando(null);
  }

  function onUpdated(updated: Usuario) {
    setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u));
  }

  if (loading) return (
    <div style={{ padding: "2rem" }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "52px", borderRadius: "8px", marginBottom: "8px" }} />)}
    </div>
  );

  return (
    <>
      {modal === "nuevo" && (
        <NuevoUsuarioModal
          onClose={() => setModal(null)}
          onCreated={u => setUsuarios(prev => [...prev, u])}
        />
      )}
      {passwordUsuario && (
        <CambiarPasswordModal
          usuario={passwordUsuario}
          onClose={() => setPasswordUsuario(null)}
          onUpdated={onUpdated}
        />
      )}

      <div style={{ padding: "1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>Usuarios del panel</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "3px" }}>Administradores y operadores con acceso al sistema</p>
          </div>
          <button
            onClick={() => setModal("nuevo")}
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 3px 10px rgba(226,75,74,0.3)", fontFamily: "inherit" }}
          >
            <UserPlus size={14} /> Nuevo usuario
          </button>
        </div>

        {/* Info de roles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.25rem" }}>
          {(["ADMIN", "OPERADOR"] as const).map(rol => {
            const info = ROL_INFO[rol];
            const Icon = rol === "ADMIN" ? Shield : Wrench;
            return (
              <div key={rol} style={{ background: info.bg, border: `1px solid ${info.border}`, borderRadius: "10px", padding: "12px 14px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Icon size={15} color={info.color} style={{ flexShrink: 0, marginTop: "1px" }} />
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: "600", color: info.color }}>{info.label}</div>
                  <div style={{ fontSize: "11.5px", color: "#555", marginTop: "3px", lineHeight: "1.45" }}>{info.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabla */}
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#FAFAF8" }}>
                {["Nombre", "Email", "Rol", "Creado", ""].map(h => (
                  <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "11.5px", fontWeight: "500", color: "#999", borderBottom: "1px solid #EBEBEB", textTransform: "uppercase", letterSpacing: "0.02em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "14px" }}>No hay usuarios registrados</td></tr>
              )}
              {usuarios.map(u => {
                const info = ROL_INFO[u.role] ?? ROL_INFO.ADMIN;
                return (
                  <tr key={u.id} className="table-row" style={{ borderBottom: "1px solid #F5F4EF" }}>
                    <td style={{ padding: "11px 1.25rem", fontWeight: "500", color: "#1a1a1a" }}>{u.name || "—"}</td>
                    <td style={{ padding: "11px 1.25rem", color: "#666" }}>{u.email}</td>
                    <td style={{ padding: "11px 1.25rem" }}>
                      <span style={{ background: info.bg, color: info.color, border: `1px solid ${info.border}`, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
                        {info.label}
                      </span>
                    </td>
                    <td style={{ padding: "11px 1.25rem", color: "#777", fontSize: "12.5px" }}>{new Date(u.createdAt).toLocaleDateString("es-CL")}</td>
                    <td style={{ padding: "11px 1.25rem" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setPasswordUsuario(u)}
                          title="Cambiar contraseña"
                          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 9px", border: "1px solid #E5E4DC", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "11.5px", color: "#555", fontFamily: "inherit" }}
                        >
                          <KeyRound size={12} color="#555" /> Contraseña
                        </button>
                        <button
                          onClick={() => eliminar(u.id)}
                          disabled={eliminando === u.id}
                          title="Eliminar usuario"
                          style={{ padding: "5px 7px", border: "1px solid #F7C1C1", borderRadius: "6px", background: "#fff", cursor: "pointer", display: "flex", opacity: eliminando === u.id ? 0.5 : 1 }}
                        >
                          <Trash2 size={13} color="#E24B4A" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
