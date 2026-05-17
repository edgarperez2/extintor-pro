"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, X, Plus } from "lucide-react";

interface Extintor {
  id: string;
  codigo: string;
  tipo: string;
  capacidad: string;
  ubicacion: string;
  mantenciones: { fecha: string; proximaFecha: string }[];
}

interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  extintores: Extintor[];
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

function estadoExtintor(ext: Extintor) {
  const ultima = ext.mantenciones[0];
  if (!ultima) return { label: "Sin mantención", bg: "#F5F4EF", color: "#666" };
  const dias = Math.round((new Date(ultima.proximaFecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return { label: "Vencido", bg: "#FCEBEB", color: "#791F1F" };
  if (dias <= 30) return { label: `Vence en ${dias}d`, bg: "#FAEEDA", color: "#633806" };
  return { label: "Al día", bg: "#EAF3DE", color: "#27500A" };
}

function EditarClienteModal({ cliente, onClose, onSaved }: { cliente: Cliente; onClose: () => void; onSaved: (c: Cliente) => void }) {
  const [form, setForm] = useState({ nombre: cliente.nombre, rut: cliente.rut, email: cliente.email, telefono: cliente.telefono || "", direccion: cliente.direccion || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.rut || !form.email) { setError("Nombre, RUT y email son obligatorios"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); setSaving(false); return; }
      onSaved({ ...cliente, ...data });
      onClose();
    } catch {
      setError("Error de conexión"); setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #E24B4A, #B22020)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>Editar cliente</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Nombre *</label>
            <input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>RUT *</label>
              <input style={inputStyle} value={form.rut} onChange={e => set("rut", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Teléfono</label>
              <input style={inputStyle} value={form.telefono} onChange={e => set("telefono", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Email *</label>
            <input type="email" style={inputStyle} value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Dirección</label>
            <input style={inputStyle} value={form.direccion} onChange={e => set("direccion", e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NuevoExtintorModal({ clienteId, onClose, onSaved }: { clienteId: string; onClose: () => void; onSaved: () => void }) {
  const TIPOS = ["PQS", "CO2", "AGUA", "ESPUMA", "HCFC"];
  const [form, setForm] = useState({ tipo: "PQS", capacidad: "", ubicacion: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.capacidad || !form.ubicacion) { setError("Todos los campos son obligatorios"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/extintores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clienteId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); setSaving(false); return; }
      onSaved(); onClose();
    } catch {
      setError("Error de conexión"); setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #E24B4A, #B22020)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>Agregar extintor</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Tipo *</label>
              <select style={{ ...inputStyle, background: "#fff" }} value={form.tipo} onChange={e => set("tipo", e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Capacidad *</label>
              <input style={inputStyle} value={form.capacidad} onChange={e => set("capacidad", e.target.value)} placeholder="6 kg" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Ubicación *</label>
            <input style={inputStyle} value={form.ubicacion} onChange={e => set("ubicacion", e.target.value)} placeholder="Pasillo principal" />
          </div>
          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClienteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"editar" | "extintor" | null>(null);

  function cargar() {
    return fetch(`/api/clientes/${id}`).then(r => r.json()).then(data => { setCliente(data); setLoading(false); });
  }

  useEffect(() => { cargar(); }, []);

  if (loading) return (
    <div style={{ padding: "2rem" }}>
      <div className="skeleton" style={{ height: "22px", width: "120px", marginBottom: "1.5rem" }} />
      <div className="skeleton" style={{ height: "100px", borderRadius: "12px", marginBottom: "1rem" }} />
      <div className="skeleton" style={{ height: "200px", borderRadius: "12px" }} />
    </div>
  );

  if (!cliente) return (
    <div style={{ padding: "2rem" }}>
      <p style={{ color: "#666", fontSize: "14px" }}>Cliente no encontrado.</p>
      <Link href="/admin/clientes" style={{ color: "#E24B4A", fontSize: "13px" }}>Volver a clientes</Link>
    </div>
  );

  return (
    <>
      {modal === "editar" && (
        <EditarClienteModal cliente={cliente} onClose={() => setModal(null)} onSaved={c => { setCliente(c); }} />
      )}
      {modal === "extintor" && (
        <NuevoExtintorModal clienteId={id} onClose={() => setModal(null)} onSaved={cargar} />
      )}

      <div style={{ padding: "1.5rem" }}>
        {/* Back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
          <Link href="/admin/clientes" style={{ display: "flex", alignItems: "center", color: "#888", textDecoration: "none" }}>
            <ArrowLeft size={16} />
          </Link>
          <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>{cliente.nombre}</h1>
        </div>

        {/* Info card */}
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", padding: "1.5rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
              {[
                { label: "RUT", value: cliente.rut },
                { label: "Email", value: cliente.email },
                { label: "Teléfono", value: cliente.telefono || "—" },
                { label: "Dirección", value: cliente.direccion || "—" },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: "11px", fontWeight: "500", color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{f.label}</div>
                  <div style={{ fontSize: "13.5px", color: "#1a1a1a" }}>{f.value}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setModal("editar")}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", border: "1px solid #E5E4DC", borderRadius: "8px", background: "#fff", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#555" }}>
              <Pencil size={13} /> Editar
            </button>
          </div>
        </div>

        {/* Extintores */}
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "14px 1.5rem", borderBottom: "1px solid #EBEBEB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>Extintores ({cliente.extintores.length})</span>
            <button onClick={() => setModal("extintor")}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 13px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "7px", fontSize: "12.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
              <Plus size={13} /> Agregar
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#FAFAF8" }}>
                {["Código", "Tipo", "Capacidad", "Ubicación", "Última mant.", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 1.5rem", textAlign: "left", fontSize: "11.5px", fontWeight: "500", color: "#999", borderBottom: "1px solid #EBEBEB", textTransform: "uppercase", letterSpacing: "0.02em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cliente.extintores.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "14px" }}>Sin extintores registrados</td></tr>
              )}
              {cliente.extintores.map(ext => {
                const estado = estadoExtintor(ext);
                const ultima = ext.mantenciones[0];
                return (
                  <tr key={ext.id} className="table-row" style={{ borderBottom: "1px solid #F5F4EF" }}>
                    <td style={{ padding: "11px 1.5rem", fontWeight: "600", fontFamily: "monospace", fontSize: "12.5px", color: "#1a1a1a" }}>{ext.codigo}</td>
                    <td style={{ padding: "11px 1.5rem", color: "#555" }}>{ext.tipo}</td>
                    <td style={{ padding: "11px 1.5rem", color: "#555" }}>{ext.capacidad}</td>
                    <td style={{ padding: "11px 1.5rem", color: "#777" }}>{ext.ubicacion}</td>
                    <td style={{ padding: "11px 1.5rem", color: "#777" }}>{ultima ? new Date(ultima.fecha).toLocaleDateString("es-CL") : "—"}</td>
                    <td style={{ padding: "11px 1.5rem" }}>
                      <span style={{ background: estado.bg, color: estado.color, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{estado.label}</span>
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