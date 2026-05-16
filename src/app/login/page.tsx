"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Flame, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"admin" | "cliente">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

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

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("resend", { email, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Error al enviar el enlace. Verifica tu email.");
    } else {
      setMagicSent(true);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px",
    borderRadius: "9px", border: "1px solid #E5E4DC",
    fontSize: "14px", color: "#1a1a1a",
    outline: "none", background: "#fff",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #EBEBEB", padding: "2.25rem 2rem", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "1.75rem" }}>
          <div style={{ width: "38px", height: "38px", background: "#E24B4A", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(226,75,74,0.35)" }}>
            <Flame size={19} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: "17px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "-0.02em" }}>ExtintorPro</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>Gestión de extintores</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "1.75rem", background: "#F5F4EF", borderRadius: "10px", padding: "4px" }}>
          {(["admin", "cliente"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setMagicSent(false); }} style={{ flex: 1, padding: "8px", borderRadius: "7px", border: "none", background: mode === m ? "#fff" : "transparent", fontWeight: mode === m ? "600" : "400", color: mode === m ? "#1a1a1a" : "#888", cursor: "pointer", fontSize: "13.5px", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.09)" : "none" }}>
              {m === "admin" ? "Administrador" : "Cliente"}
            </button>
          ))}
        </div>

        {/* Admin form */}
        {mode === "admin" && (
          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: "13px" }}>
              <label style={{ fontSize: "12.5px", color: "#666", display: "block", marginBottom: "5px", fontWeight: "500" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@extintor.pro" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "12.5px", color: "#666", display: "block", marginBottom: "5px", fontWeight: "500" }}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            {error && (
              <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "9px 12px", color: "#791F1F", fontSize: "13px", marginBottom: "14px" }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "11px", background: "#E24B4A", color: "#fff", border: "none", borderRadius: "9px", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.72 : 1, letterSpacing: "-0.01em" }}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        )}

        {/* Cliente magic link */}
        {mode === "cliente" && !magicSent && (
          <form onSubmit={handleMagicLink}>
            <p style={{ fontSize: "13.5px", color: "#777", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              Ingresa tu email y te enviaremos un enlace de acceso seguro, sin contraseña.
            </p>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "12.5px", color: "#666", display: "block", marginBottom: "5px", fontWeight: "500" }}>Email corporativo</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.cl" required style={inputStyle} />
            </div>
            {error && (
              <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "9px 12px", color: "#791F1F", fontSize: "13px", marginBottom: "14px" }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "11px", background: "#E24B4A", color: "#fff", border: "none", borderRadius: "9px", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.72 : 1 }}>
              {loading ? "Enviando..." : "Enviar enlace de acceso"}
            </button>
          </form>
        )}

        {/* Magic link enviado */}
        {mode === "cliente" && magicSent && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ width: "52px", height: "52px", background: "#EAF3DE", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Mail size={24} color="#27500A" strokeWidth={1.8} />
            </div>
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px", letterSpacing: "-0.01em" }}>Revisa tu email</p>
            <p style={{ fontSize: "13.5px", color: "#777", lineHeight: 1.5 }}>
              Enviamos un enlace de acceso a <strong style={{ color: "#1a1a1a" }}>{email}</strong>. Úsalo para ingresar.
            </p>
            <button onClick={() => setMagicSent(false)} style={{ marginTop: "1.25rem", background: "none", border: "none", color: "#E24B4A", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
              Usar otro email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
