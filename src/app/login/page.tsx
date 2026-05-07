// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

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

    const result = await signIn("resend", {
      email,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Error al enviar el enlace. Verifica tu email.");
    } else {
      setMagicSent(true);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F4EF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        border: "0.5px solid #E5E4DC",
        padding: "2rem",
        width: "100%",
        maxWidth: "400px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
          <div style={{
            width: "36px", height: "36px", background: "#E24B4A",
            borderRadius: "8px", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#fff", fontWeight: "600",
          }}>EX</div>
          <span style={{ fontSize: "18px", fontWeight: "500" }}>ExtintorPro</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "1.5rem", background: "#F5F4EF", borderRadius: "8px", padding: "4px" }}>
          {(["admin", "cliente"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setMagicSent(false); }} style={{
              flex: 1, padding: "7px", borderRadius: "6px", border: "none",
              background: mode === m ? "#fff" : "transparent",
              fontWeight: mode === m ? "500" : "400",
              cursor: "pointer", fontSize: "13px",
              boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
              {m === "admin" ? "Administrador" : "Cliente"}
            </button>
          ))}
        </div>

        {/* Admin form */}
        {mode === "admin" && (
          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "4px" }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@extintor.pro" required
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "0.5px solid #E5E4DC", fontSize: "13px" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "4px" }}>Contraseña</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "0.5px solid #E5E4DC", fontSize: "13px" }}
              />
            </div>
            {error && <p style={{ color: "#A32D2D", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "10px", background: "#E24B4A", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        )}

        {/* Cliente magic link */}
        {mode === "cliente" && !magicSent && (
          <form onSubmit={handleMagicLink}>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "1rem" }}>
              Ingresa tu email y te enviaremos un enlace para acceder sin contraseña.
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "4px" }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.cl" required
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "0.5px solid #E5E4DC", fontSize: "13px" }}
              />
            </div>
            {error && <p style={{ color: "#A32D2D", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "10px", background: "#E24B4A", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "Enviando..." : "Enviar enlace de acceso"}
            </button>
          </form>
        )}

        {/* Magic link enviado */}
        {mode === "cliente" && magicSent && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📧</div>
            <p style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Revisa tu email</p>
            <p style={{ fontSize: "13px", color: "#666" }}>
              Enviamos un enlace de acceso a <strong>{email}</strong>. Úsalo para ingresar.
            </p>
            <button onClick={() => setMagicSent(false)} style={{
              marginTop: "1rem", background: "none", border: "none",
              color: "#E24B4A", cursor: "pointer", fontSize: "13px",
            }}>
              Usar otro email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
