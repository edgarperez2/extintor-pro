"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, X, Search } from "lucide-react";

interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono?: string;
  direccion?: string;
  resumen: { total: number; vencidos: number; proximos: number; alDia: number };
}

function badge(type: "ok" | "warn" | "danger", text: string) {
  const styles: Record<string, React.CSSProperties> = {
    ok: { background: "#EAF3DE", color: "#27500A" },
    warn: { background: "#FAEEDA", color: "#633806" },
    danger: { background: "#FCEBEB", color: "#791F1F" },
  };
  return <span style={{ ...styles[type], padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{text}</span>;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

function NuevoClienteModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Cliente) => void }) {
  const [form, setForm] = useState({ nombre: "", rut: "", email: "", telefono: "", direccion: "", crearUsuario: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.rut || !form.email) { setError("Nombre, RUT y email son obligatorios"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al crear cliente"); setSaving(false); return; }
      onCreated({ ...data, resumen: { total: 0, vencidos: 0, proximos: 0, alDia: 0 } });
      onClose();
    } catch {
      setError("Error de conexión");
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #E24B4A, #B22020)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>Nuevo cliente</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}>
            <X size={16} color="#fff" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && (
            <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>
          )}

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Nombre *</label>
            <input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Razón social o nombre" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>RUT *</label>
              <input style={inputStyle} value={form.rut} onChange={e => set("rut", e.target.value)} placeholder="12.345.678-9" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Teléfono</label>
              <input style={inputStyle} value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="+56 9 1234 5678" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Email *</label>
            <input style={inputStyle} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="contacto@empresa.cl" />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Dirección</label>
            <input style={inputStyle} value={form.direccion} onChange={e => set("direccion", e.target.value)} placeholder="Av. Ejemplo 1234, Santiago" />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 12px", background: "#F5F4EF", borderRadius: "8px", fontSize: "13.5px", color: "#444" }}>
            <input type="checkbox" checked={form.crearUsuario} onChange={e => set("crearUsuario", e.target.checked)} style={{ width: "15px", height: "15px", accentColor: "#E24B4A" }} />
            <span>Crear cuenta de acceso para el cliente</span>
          </label>

          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Guardando..." : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  function cargar() {
    fetch("/api/clientes").then((r) => r.json()).then((data) => { setClientes(data); setLoading(false); });
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.rut.includes(busqueda) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: "2rem" }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton" style={{ height: "44px", borderRadius: "8px", marginBottom: "8px" }} />
      ))}
    </div>
  );

  return (
    <>
      {modalOpen && (
        <NuevoClienteModal
          onClose={() => setModalOpen(false)}
          onCreated={(c) => { setClientes(prev => [c, ...prev]); }}
        />
      )}

      <div style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>Clientes</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#aaa" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cliente..."
                style={{ padding: "8px 12px 8px 32px", borderRadius: "8px", border: "1px solid #E5E4DC", fontSize: "13px", width: "220px", fontFamily: "inherit", outline: "none" }}
              />
            </div>
            <button
              onClick={() => setModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 3px 10px rgba(226,75,74,0.3)", fontFamily: "inherit" }}
            >
              <UserPlus size={14} /> Nuevo cliente
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#FAFAF8" }}>
                {["Cliente", "RUT", "Email", "Extintores", "Estado", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "11.5px", fontWeight: "500", color: "#999", borderBottom: "1px solid #EBEBEB", textTransform: "uppercase", letterSpacing: "0.02em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
                  {busqueda ? "Sin resultados para la búsqueda" : "No hay clientes registrados"}
                </td></tr>
              )}
              {filtrados.map((c) => (
                <tr key={c.id} className="table-row" style={{ borderBottom: "1px solid #F5F4EF" }}>
                  <td style={{ padding: "11px 1.25rem", fontWeight: "500", color: "#1a1a1a" }}>{c.nombre}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#666", fontFamily: "monospace", fontSize: "12.5px" }}>{c.rut}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#666" }}>{c.email}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#555" }}>{c.resumen.total}</td>
                  <td style={{ padding: "11px 1.25rem" }}>
                    {c.resumen.vencidos > 0 && badge("danger", `${c.resumen.vencidos} vencido(s)`)}
                    {c.resumen.vencidos === 0 && c.resumen.proximos > 0 && badge("warn", `${c.resumen.proximos} próximo(s)`)}
                    {c.resumen.vencidos === 0 && c.resumen.proximos === 0 && c.resumen.total > 0 && badge("ok", "Al día")}
                    {c.resumen.total === 0 && <span style={{ color: "#bbb", fontSize: "12px" }}>Sin extintores</span>}
                  </td>
                  <td style={{ padding: "11px 1.25rem" }}>
                    <Link href={`/admin/clientes/${c.id}`} style={{ fontSize: "12px", color: "#666", textDecoration: "none", padding: "5px 10px", border: "1px solid #E5E4DC", borderRadius: "6px" }}>Ver detalle →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
