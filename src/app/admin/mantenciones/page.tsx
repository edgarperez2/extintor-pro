"use client";

import { useEffect, useState } from "react";
import { Plus, X, Search, Pencil, Trash2, FileDown } from "lucide-react";

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

const ESTADOS = ["PROGRAMADA", "COMPLETADA", "CANCELADA"];

/* ─── Modal registrar / editar ───────────────────────────────────────────── */
function MantencionModal({
  mantencion, onClose, onSaved,
}: { mantencion?: Mantencion; onClose: () => void; onSaved: () => void }) {
  const esEdicion = !!mantencion;
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [form, setForm] = useState({
    extintorId: "",
    fecha: mantencion ? mantencion.fecha.split("T")[0] : "",
    proximaFecha: mantencion ? mantencion.proximaFecha.split("T")[0] : "",
    tecnico: mantencion?.tecnico ?? "",
    observaciones: mantencion?.observaciones ?? "",
    estado: mantencion?.estado ?? "COMPLETADA",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!esEdicion) fetch("/api/clientes").then(r => r.json()).then(setClientes);
  }, [esEdicion]);

  useEffect(() => {
    if (!clienteId) { setExtintores([]); return; }
    fetch(`/api/extintores?clienteId=${clienteId}`).then(r => r.json()).then(setExtintores);
  }, [clienteId]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!esEdicion && !form.extintorId) { setError("Selecciona un extintor"); return; }
    if (!form.fecha) { setError("La fecha de mantención es obligatoria"); return; }
    setSaving(true); setError("");
    try {
      const url = esEdicion ? `/api/mantenciones/${mantencion!.id}` : "/api/mantenciones";
      const method = esEdicion ? "PUT" : "POST";
      const body = esEdicion
        ? { fecha: form.fecha, proximaFecha: form.proximaFecha, tecnico: form.tecnico, observaciones: form.observaciones, estado: form.estado }
        : { extintorId: form.extintorId, fecha: form.fecha, tecnico: form.tecnico, observaciones: form.observaciones };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); setSaving(false); return; }
      onSaved(); onClose();
    } catch { setError("Error de conexión"); setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #E24B4A, #B22020)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>{esEdicion ? "Editar mantención" : "Registrar mantención"}</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}

          {!esEdicion && (
            <>
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
            </>
          )}

          {esEdicion && (
            <div style={{ background: "#F5F4EF", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#555" }}>
              Extintor: <strong>{mantencion!.extintor.codigo}</strong> · {mantencion!.extintor.cliente.nombre}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Fecha realizada *</label>
              <input type="date" style={inputStyle} value={form.fecha} onChange={e => set("fecha", e.target.value)} />
            </div>
            {esEdicion && (
              <div>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Próxima fecha</label>
                <input type="date" style={inputStyle} value={form.proximaFecha} onChange={e => set("proximaFecha", e.target.value)} />
              </div>
            )}
          </div>

          {esEdicion && (
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Estado</label>
              <select style={{ ...inputStyle, background: "#fff" }} value={form.estado} onChange={e => set("estado", e.target.value)}>
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

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
              {saving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Badge estado ───────────────────────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    COMPLETADA: { bg: "#EAF3DE", color: "#27500A" },
    PROGRAMADA: { bg: "#EEF2FF", color: "#3730A3" },
    CANCELADA:  { bg: "#F5F4EF", color: "#666" },
  };
  const s = styles[estado] ?? { bg: "#F5F4EF", color: "#666" };
  return <span style={{ background: s.bg, color: s.color, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{estado}</span>;
}

/* ─── Exportar PDF ───────────────────────────────────────────────────────── */
function exportarPDF(mantenciones: Mantencion[]) {
  const filas = mantenciones.map(m => `
    <tr>
      <td>${m.extintor.cliente.nombre}</td>
      <td style="font-family:monospace">${m.extintor.codigo}</td>
      <td>${m.extintor.tipo} ${m.extintor.capacidad}</td>
      <td>${new Date(m.fecha).toLocaleDateString("es-CL")}</td>
      <td>${new Date(m.proximaFecha).toLocaleDateString("es-CL")}</td>
      <td>${m.tecnico ?? "—"}</td>
      <td>${m.estado}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Reporte de Mantenciones — ExtintorPro</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 24px; }
      h1 { font-size: 18px; color: #E24B4A; margin-bottom: 4px; }
      .sub { font-size: 11px; color: #888; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #E24B4A; color: #fff; padding: 7px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
      td { padding: 7px 10px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) td { background: #FAFAF8; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h1>Reporte de Mantenciones</h1>
    <p class="sub">ExtintorPro · Generado el ${new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })} · ${mantenciones.length} registro(s)</p>
    <table>
      <thead><tr><th>Cliente</th><th>Extintor</th><th>Tipo</th><th>Fecha realizada</th><th>Próxima fecha</th><th>Técnico</th><th>Estado</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <script>window.onload=()=>{ window.print(); }<\/script>
    </body></html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("Permite las ventanas emergentes para exportar el PDF."); return; }
  win.document.write(html);
  win.document.close();
}

/* ─── Página principal ───────────────────────────────────────────────────── */
export default function MantencionesPage() {
  const [mantenciones, setMantenciones] = useState<Mantencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [seleccionada, setSeleccionada] = useState<Mantencion | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  function cargar() {
    return fetch("/api/mantenciones").then(r => r.json()).then(data => { setMantenciones(Array.isArray(data) ? data : []); setLoading(false); });
  }

  useEffect(() => { cargar(); }, []);

  async function eliminar(m: Mantencion) {
    if (!confirm(`¿Eliminar la mantención del extintor ${m.extintor.codigo}? Esta acción no se puede deshacer.`)) return;
    setEliminando(m.id);
    await fetch(`/api/mantenciones/${m.id}`, { method: "DELETE" });
    setMantenciones(prev => prev.filter(x => x.id !== m.id));
    setEliminando(null);
  }

  const filtrados = mantenciones.filter(m =>
    m.extintor.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.extintor.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.tecnico ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: "2rem" }}>
      {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "44px", borderRadius: "8px", marginBottom: "8px" }} />)}
    </div>
  );

  return (
    <>
      {modal === "nuevo" && <MantencionModal onClose={() => setModal(null)} onSaved={cargar} />}
      {modal === "editar" && seleccionada && (
        <MantencionModal
          mantencion={seleccionada}
          onClose={() => { setModal(null); setSeleccionada(null); }}
          onSaved={cargar}
        />
      )}

      <div style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>Mantenciones</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#aaa" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..."
                style={{ padding: "8px 12px 8px 32px", borderRadius: "8px", border: "1px solid #E5E4DC", fontSize: "13px", width: "200px", fontFamily: "inherit", outline: "none" }} />
            </div>
            <button
              onClick={() => exportarPDF(filtrados)}
              disabled={filtrados.length === 0}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", background: "#fff", color: "#555", border: "1px solid #E5E4DC", borderRadius: "8px", fontSize: "13px", cursor: filtrados.length === 0 ? "not-allowed" : "pointer", opacity: filtrados.length === 0 ? 0.5 : 1, fontFamily: "inherit" }}>
              <FileDown size={14} /> Exportar PDF
            </button>
            <button onClick={() => setModal("nuevo")}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 3px 10px rgba(226,75,74,0.3)", fontFamily: "inherit" }}>
              <Plus size={14} /> Registrar mantención
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#FAFAF8" }}>
                {["Cliente", "Extintor", "Fecha realizada", "Próxima fecha", "Técnico", "Estado", ""].map(h => (
                  <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "11.5px", fontWeight: "500", color: "#999", borderBottom: "1px solid #EBEBEB", textTransform: "uppercase", letterSpacing: "0.02em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
                  {busqueda ? "Sin resultados" : "No hay mantenciones registradas"}
                </td></tr>
              )}
              {filtrados.map(m => (
                <tr key={m.id} className="table-row" style={{ borderBottom: "1px solid #F5F4EF" }}>
                  <td style={{ padding: "11px 1.25rem", color: "#555" }}>{m.extintor.cliente.nombre}</td>
                  <td style={{ padding: "11px 1.25rem", fontWeight: "600", fontFamily: "monospace", fontSize: "12.5px", color: "#1a1a1a" }}>{m.extintor.codigo}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#666" }}>{new Date(m.fecha).toLocaleDateString("es-CL")}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#666" }}>{new Date(m.proximaFecha).toLocaleDateString("es-CL")}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#666" }}>{m.tecnico ?? "—"}</td>
                  <td style={{ padding: "11px 1.25rem" }}><EstadoBadge estado={m.estado} /></td>
                  <td style={{ padding: "11px 1.25rem" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => { setSeleccionada(m); setModal("editar"); }}
                        title="Editar"
                        style={{ padding: "5px", border: "1px solid #E5E4DC", borderRadius: "6px", background: "#fff", cursor: "pointer", display: "flex" }}>
                        <Pencil size={13} color="#666" />
                      </button>
                      <button
                        onClick={() => eliminar(m)}
                        disabled={eliminando === m.id}
                        title="Eliminar"
                        style={{ padding: "5px", border: "1px solid #F7C1C1", borderRadius: "6px", background: "#fff", cursor: "pointer", display: "flex", opacity: eliminando === m.id ? 0.5 : 1 }}>
                        <Trash2 size={13} color="#E24B4A" />
                      </button>
                    </div>
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
