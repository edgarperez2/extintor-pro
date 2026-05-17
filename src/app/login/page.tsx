"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function ExtintorIlustration() {
  return (
    <svg width="160" height="256" viewBox="0 0 60 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="38" width="32" height="54" rx="16" fill="white" fillOpacity="0.95" />
      <rect x="21" y="22" width="18" height="20" rx="5" fill="white" fillOpacity="0.95" />
      <rect x="16" y="16" width="28" height="9" rx="4.5" fill="white" fillOpacity="0.95" />
      <rect x="7" y="17" width="13" height="4" rx="2" fill="white" fillOpacity="0.95" />
      <rect x="7" y="17" width="4" height="13" rx="2" fill="white" fillOpacity="0.95" />
      <path d="M46 56 C58 56 58 70 46 70" stroke="white" strokeOpacity="0.9" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="37" y="67" width="13" height="6" rx="3" fill="white" fillOpacity="0.9" />
      <circle cx="30" cy="62" r="8" fill="white" fillOpacity="0.15" />
      <circle cx="30" cy="62" r="8" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
      <line x1="30" y1="60" x2="33" y2="63" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
      <circle cx="30" cy="16" r="3.5" stroke="white" strokeWidth="1.5" fillOpacity="0" strokeOpacity="0.8" />
      <line x1="30" y1="12.5" x2="30" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
      <rect x="19" y="44" width="5" height="32" rx="2.5" fill="white" fillOpacity="0.12" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"admin" | "cliente">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Email o contraseña incorrectos");
    } else {
      router.push("/admin");
    }
  }

  async function handleClienteLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Email o contraseña incorrectos");
    } else {
      router.push("/cliente");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    borderRadius: "10px", border: "1.5px solid #E8E7E0",
    fontSize: "14px", color: "#1a1a1a",
    outline: "none", background: "#FAFAF8",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>

      {/* Left panel — brand + illustration */}
      <div style={{
        flex: 1,
        background: "linear-gradient(145deg, #E24B4A 0%, #B22020 55%, #7A1010 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "3rem 2.5rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", top: "-150px", left: "-150px" }} />
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", bottom: "-80px", right: "-80px" }} />
        <div style={{ position: "absolute", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", bottom: "120px", left: "30px" }} />

        <div style={{ position: "relative", textAlign: "center", maxWidth: "340px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "3rem" }}>
            <div style={{ width: "38px", height: "38px", background: "rgba(255,255,255,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C10 2 6 6 6 10C6 12.2 7.8 14 10 14C12.2 14 14 12.2 14 10C14 8 12 6 12 6C12 6 11.5 8 10 8C8.5 8 8 6.5 10 2Z" fill="white" />
              </svg>
            </div>
            <span style={{ fontSize: "22px", fontWeight: "700", color: "#fff", letterSpacing: "-0.02em" }}>ExtintorPro</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))" }}>
            <ExtintorIlustration />
          </div>

          <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: "12px" }}>
            Gestión inteligente de extintores
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>
            Control total de mantenciones, vencimientos y cumplimiento normativo.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            {[{ value: "100%", label: "Cumplimiento" }, { value: "QR", label: "Trazabilidad" }, { value: "24/7", label: "Monitoreo" }].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ width: "440px", flexShrink: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 2.5rem", boxShadow: "-8px 0 32px rgba(0,0,0,0.08)" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: "6px" }}>
              Iniciar sesión
            </h1>
            <p style={{ fontSize: "14px", color: "#888" }}>
              Accede a tu panel de {mode === "admin" ? "administración" : "extintores"}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "1.75rem", background: "#F5F4EF", borderRadius: "10px", padding: "4px" }}>
            {(["admin", "cliente"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setMagicSent(false); }} style={{ flex: 1, padding: "8px", borderRadius: "7px", border: "none", background: mode === m ? "#fff" : "transparent", fontWeight: mode === m ? "600" : "400", color: mode === m ? "#1a1a1a" : "#888", cursor: "pointer", fontSize: "13.5px", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.09)" : "none" }}>
                {m === "admin" ? "Administrador" : "Cliente"}
              </button>
            ))}
          </div>

          {mode === "admin" && (
            <form onSubmit={handleAdminLogin}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12.5px", color: "#555", display: "block", marginBottom: "6px", fontWeight: "500" }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@extintor.pro" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "12.5px", color: "#555", display: "block", marginBottom: "6px", fontWeight: "500" }}>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
              </div>
              {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 13px", color: "#791F1F", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14.5px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1, boxShadow: "0 4px 14px rgba(226,75,74,0.4)", letterSpacing: "-0.01em" }}>
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          )}

          {mode === "cliente" && (
            <form onSubmit={handleClienteLogin}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12.5px", color: "#555", display: "block", marginBottom: "6px", fontWeight: "500" }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.cl" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "12.5px", color: "#555", display: "block", marginBottom: "6px", fontWeight: "500" }}>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
              </div>
              {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 13px", color: "#791F1F", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14.5px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1, boxShadow: "0 4px 14px rgba(226,75,74,0.4)" }}>
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
              <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginTop: "1.25rem" }}>
                ¿No tienes cuenta?{" "}
                <a href="/registro" style={{ color: "#E24B4A", fontWeight: "500", textDecoration: "none" }}>Regístrate aquí</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
