"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

function ExtintorIlustration() {
  return (
    <svg width="110" height="176" viewBox="0 0 60 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.25))", opacity: 0.92 }}>
      <rect x="14" y="38" width="32" height="54" rx="16" fill="white" fillOpacity="0.95" />
      <rect x="21" y="22" width="18" height="20" rx="5" fill="white" fillOpacity="0.85" />
      <rect x="16" y="16" width="28" height="9" rx="4.5" fill="white" fillOpacity="0.9" />
      <rect x="7" y="17" width="13" height="4" rx="2" fill="white" fillOpacity="0.8" />
      <rect x="7" y="17" width="4" height="13" rx="2" fill="white" fillOpacity="0.8" />
      <path d="M46 56 C58 56 58 70 46 70" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeOpacity="0.8" />
      <rect x="37" y="67" width="13" height="6" rx="3" fill="white" fillOpacity="0.75" />
      <circle cx="30" cy="62" r="8" fill="white" fillOpacity="0.12" />
      <circle cx="30" cy="62" r="8" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" />
      <rect x="19" y="44" width="5" height="32" rx="2.5" fill="white" fillOpacity="0.15" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: "9px",
  border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box", color: "#1a1a1a",
};

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", rut: "", email: "", telefono: "", direccion: "", password: "", confirmar: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.rut || !form.email || !form.password) { setError("Todos los campos obligatorios deben completarse"); return; }
    if (form.password.length < 6) { setError("La contrasena debe tener al menos 6 caracteres"); return; }
    if (form.password !== form.confirmar) { setError("Las contrasenas no coinciden"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.nombre, rut: form.rut, email: form.email, telefono: form.telefono, direccion: form.direccion, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al registrar"); setSaving(false); return; }
      setDone(true);
    } catch {
      setError("Error de conexion"); setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left panel */}
      <div style={{ flex: "0 0 380px", background: "linear-gradient(145deg, #E24B4A 0%, #B22020 55%, #7A1010 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "40px", right: "30px", opacity: 0.12, transform: "rotate(10deg)" }}><ExtintorIlustration /></div>
        <div style={{ position: "absolute", bottom: "30px", left: "20px", opacity: 0.1, transform: "rotate(-8deg) scale(0.7)", transformOrigin: "bottom left" }}><ExtintorIlustration /></div>
        <div style={{ position: "relative", textAlign: "center" }}>
          <ExtintorIlustration />
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", letterSpacing: "-0.03em", marginTop: "1.5rem", marginBottom: "0.5rem" }}>ExtintorPro</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>Gestiona el mantenimiento<br />de tus extintores en linea</p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF8", padding: "2rem", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "64px", height: "64px", background: "#EAF3DE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                <CheckCircle size={32} color="#27500A" />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a", marginBottom: "10px" }}>Cuenta creada</h2>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                Tu cuenta fue creada exitosamente. Ya puedes iniciar sesion con tu email y contrasena.
              </p>
              <Link href="/login" style={{ display: "inline-block", padding: "11px 32px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", borderRadius: "9px", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>
                Iniciar sesion
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "1.75rem" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: "6px" }}>Crear cuenta</h2>
                <p style={{ fontSize: "13.5px", color: "#888" }}>Completa el formulario para registrarte</p>
              </div>

              {error && (
                <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 13px", fontSize: "13px", color: "#791F1F", marginBottom: "1rem" }}>{error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Nombre o razon social *</label>
                  <input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Empresa o nombre completo" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>RUT *</label>
                    <input style={inputStyle} value={form.rut} onChange={e => set("rut", e.target.value)} placeholder="12.345.678-9" />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Telefono</label>
                    <input style={inputStyle} value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="+56 9 ..." />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Email *</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="correo@empresa.cl" />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Direccion</label>
                  <input style={inputStyle} value={form.direccion} onChange={e => set("direccion", e.target.value)} placeholder="Av. Ejemplo 1234, Santiago" />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Contrasena *</label>
                  <div style={{ position: "relative" }}>
                    <input style={{ ...inputStyle, paddingRight: "40px" }} type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="Minimo 6 caracteres" />
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      {showPass ? <EyeOff size={15} color="#aaa" /> : <Eye size={15} color="#aaa" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Confirmar contrasena *</label>
                  <input style={inputStyle} type="password" value={form.confirmar} onChange={e => set("confirmar", e.target.value)} placeholder="Repite la contrasena" />
                </div>

                <button type="submit" disabled={saving} style={{ width: "100%", padding: "12px", borderRadius: "9px", border: "none", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit", marginTop: "4px", boxShadow: "0 4px 14px rgba(226,75,74,0.35)" }}>
                  {saving ? "Creando cuenta..." : "Crear cuenta"}
                </button>

                <p style={{ textAlign: "center", fontSize: "13px", color: "#888" }}>
                  Ya tienes cuenta?{" "}
                  <Link href="/login" style={{ color: "#E24B4A", fontWeight: "500", textDecoration: "none" }}>Iniciar sesion</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}