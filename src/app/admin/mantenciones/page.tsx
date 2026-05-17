"use client";

import { useEffect, useState } from "react";
import { Plus, X, Search } from "lucide-react";

interface Cliente { id: string; nombre: string; }
interface Extintor { id: string; codigo: string; tipo: string; capacidad: string; clienteId: string; cliente: { id: string; nombre: string }; }

interface Mantencion {
  id: string;
  fecha: string;
  proximaFecha: string;
  tecnico: string | null;
  observaciones: string | null;
  estado: string;
  extintor: { codigo: string; tipo: string; capacidad: string; cliente: { nombre: string } };
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

function RegistrarModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [form, setForm] = useState({ extintorId: "", fecha: "", tecnico: "", observaciones: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clientes").then(r => r.json()).then(setClientes);
  }, []);

  useEffect(() => {
    if (!clienteId) { setExtintores([]); return; }
    fetch(`/api/extintores?clienteId=${clienteId}`).then(r => r.json()).then(setExtintores);
  }, [clienteId]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.extintorId || !form.fecha) { setError("Extintor y fecha son obligatorios"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/mantenciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #E24B4A, #B22020)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>Registrar mantención</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Cliente *</label>
            <select style={{ ...inputStyle, background: "#fff" }} value={clienteId} onChange={e => { setClienteId(e.target.value); set("extintorId", ""); }}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Extintor *</label>
            <select style={{ ...inputStyle, background: "#fff" }} value={form.extintorId} onChange={e => set("extintorId", e.target.value)} disabled={!clienteId}>
              <option value="">{clienteId ? "Seleccionar extintor..." : "Primero selecciona un cliente"}</option>
              {extintores.map(e => <option key={e.id} value={e.id}>{e.codigo} — {e.tipo} {e.capacidad}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Fecha de mantención *</label>
            <input type="date" style={inputStyle} value={form.fecha} onChange={e => set("fecha", e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Técnico</label>
            <input style={inputStyle} value={form.tecnico} onChange={e => set("tecnico", e.target.value)} placeholder="Nombre del técnico" />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Observaciones</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "70px" }} value={form.observaciones} onChange={e => set("observaciones", e.target.value)} placeholder="Notas adicionales..." />
          </div>

          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Guardando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    COMPLETADA: { bg: "#EAF3DE", color: "#27500A" },
    PROGRAMADA: { bg: "#EEF2FF", color: "#3730A3" },
    CANCELADA: { bg: "#F5F4EF", color: "#666" },
  };
  const s = styles[estado] ?? { bg: "#F5F4EF", color: "#666" };
  return <span style={{ background: s.bg, color: s.color, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{estado}</span>;
}

export default function MantencionesPage() {
  const [mantenciones, setMantenciones] = useState<Mantencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  function cargar() {
    return fetch("/api/mantenciones").then(r => r.json()).then(data => { setMantenciones(data); setLoading(false); });
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = mantenciones.filter(m =>
    m.extintor.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.extintor.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.tecnico || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: "2rem" }}>
      {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "44px", borderRadius: "8px", marginBottom: "8px" }} />)}
    </div>
  );

  return (
    <>
      {modalOpen && <RegistrarModal onClose={() => setModalOpen(false)} onSaved={cargar} />}

      <div style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>Mantenciones</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#aaa" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..."
                style={{ padding: "8px 12px 8px 32px", borderRadius: "8px", border: "1px solid #E5E4DC", fontSize: "13px", width: "200px", fontFamily: "inherit", outline: "none" }} />
            </div>
            <button onClick={() => setModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 3px 10px rgba(226,75,74,0.3)", fontFamily: "inherit" }}>
              <Plus size={14} /> Registrar mantención
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#FAFAF8" }}>
                {["Cliente", "Extintor", "Fecha realizada", "Próxima fecha", "Técnico", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "11.5px", fontWeight: "500", color: "#999", borderBottom: "1px solid #EBEBEB", textTransform: "uppercase", letterSpacing: "0.02em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
                  {busqueda ? "Sin resultados" : "No hay mantenciones registradas"}
                </td></tr>
              )}
              {filtrados.map(m => (
                <tr key={m.id} className="table-row" style={{ borderBottom: "1px solid #F5F4EF" }}>
                  <td style={{ padding: "11px 1.25rem", color: "#555" }}>{m.extintor.cliente.nombre}</td>
                  <td style={{ padding: "11px 1.25rem", fontWeight: "600", fontFamily: "monospace", fontSize: "12.5px", color: "#1a1a1a" }}>{m.extintor.codigo}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#666" }}>{new Date(m.fecha).toLocaleDateString("es-CL")}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#666" }}>{new Date(m.proximaFecha).toLocaleDateString("es-CL")}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#666" }}>{m.tecnico || "—"}</td>
                  <td style={{ padding: "11px 1.25rem" }}><EstadoBadge estado={m.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
