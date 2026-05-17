"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";

interface Cliente { id: string; nombre: string; }

interface Extintor {
  id: string;
  codigo: string;
  tipo: string;
  capacidad: string;
  ubicacion: string;
  estado: string;
  diasRestantes: number | null;
  cliente: { id: string; nombre: string };
  ultimaMantencion: string | null;
  proximaMantencion: string | null;
}

const TIPOS = ["PQS", "CO2", "AGUA", "ESPUMA", "HCFC"];

function Badge({ estado, dias }: { estado: string; dias: number | null }) {
  if (estado === "VENCIDO") return <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Vencido</span>;
  if (estado === "PROXIMO") return <span style={{ background: "#FAEEDA", color: "#633806", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{`Vence en ${dias}d`}</span>;
  if (estado === "AL_DIA") return <span style={{ background: "#EAF3DE", color: "#27500A", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Al día</span>;
  return <span style={{ background: "#F5F4EF", color: "#666", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>Sin mantención</span>;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

type FormData = { clienteId: string; tipo: string; capacidad: string; ubicacion: string };

function ExtintorModal({
  modo, extintor, clientes, onClose, onSaved,
}: {
  modo: "crear" | "editar";
  extintor?: Extintor;
  clientes: Cliente[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormData>({
    clienteId: extintor?.cliente.id ?? "",
    tipo: extintor?.tipo ?? "PQS",
    capacidad: extintor?.capacidad ?? "",
    ubicacion: extintor?.ubicacion ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clienteId || !form.tipo || !form.capacidad || !form.ubicacion) {
      setError("Todos los campos son obligatorios"); return;
    }
    setSaving(true); setError("");
    try {
      const url = modo === "crear" ? "/api/extintores" : `/api/extintores/${extintor!.id}`;
      const method = modo === "crear" ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); setSaving(false); return; }
      onSaved(); onClose();
    } catch {
      setError("Error de conexión"); setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #E24B4A, #B22020)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>{modo === "crear" ? "Nuevo extintor" : "Editar extintor"}</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}

          {modo === "crear" && (
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Cliente *</label>
              <select style={{ ...inputStyle, background: "#fff" }} value={form.clienteId} onChange={e => set("clienteId", e.target.value)}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )}

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
              {saving ? "Guardando..." : modo === "crear" ? "Crear extintor" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({ extintor, onClose, onConfirm }: { extintor: Extintor; onClose: () => void; onConfirm: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "360px", padding: "1.75rem", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>Eliminar extintor</h3>
        <p style={{ fontSize: "13.5px", color: "#666", marginBottom: "1.5rem", lineHeight: 1.5 }}>
          ¿Confirmas eliminar el extintor <strong>{extintor.codigo}</strong>? Esta acción no se puede deshacer.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); }}
            disabled={loading}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#E24B4A", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExtintoresPage() {
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState<"crear" | "editar" | "eliminar" | null>(null);
  const [seleccionado, setSeleccionado] = useState<Extintor | null>(null);

  function cargar() {
    return fetch("/api/extintores").then(r => r.json()).then(data => { setExtintores(data); setLoading(false); });
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/extintores").then(r => r.json()),
      fetch("/api/clientes").then(r => r.json()),
    ]).then(([exts, cls]) => { setExtintores(exts); setClientes(cls); setLoading(false); });
  }, []);

  async function handleDelete() {
    if (!seleccionado) return;
    await fetch(`/api/extintores/${seleccionado.id}`, { method: "DELETE" });
    await cargar();
    setModal(null); setSeleccionado(null);
  }

  const filtrados = extintores.filter(e =>
    e.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: "2rem" }}>
      {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "44px", borderRadius: "8px", marginBottom: "8px" }} />)}
    </div>
  );

  return (
    <>
      {modal === "crear" && (
        <ExtintorModal modo="crear" clientes={clientes} onClose={() => setModal(null)} onSaved={cargar} />
      )}
      {modal === "editar" && seleccionado && (
        <ExtintorModal modo="editar" extintor={seleccionado} clientes={clientes} onClose={() => { setModal(null); setSeleccionado(null); }} onSaved={cargar} />
      )}
      {modal === "eliminar" && seleccionado && (
        <ConfirmModal extintor={seleccionado} onClose={() => { setModal(null); setSeleccionado(null); }} onConfirm={handleDelete} />
      )}

      <div style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>Extintores</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#aaa" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar extintor..."
                style={{ padding: "8px 12px 8px 32px", borderRadius: "8px", border: "1px solid #E5E4DC", fontSize: "13px", width: "220px", fontFamily: "inherit", outline: "none" }} />
            </div>
            <button onClick={() => setModal("crear")}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 3px 10px rgba(226,75,74,0.3)", fontFamily: "inherit" }}>
              <Plus size={14} /> Nuevo extintor
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#FAFAF8" }}>
                {["Código", "Cliente", "Tipo", "Capacidad", "Ubicación", "Últ. mantención", "Estado", ""].map(h => (
                  <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "11.5px", fontWeight: "500", color: "#999", borderBottom: "1px solid #EBEBEB", textTransform: "uppercase", letterSpacing: "0.02em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
                  {busqueda ? "Sin resultados" : "No hay extintores registrados"}
                </td></tr>
              )}
              {filtrados.map(ext => (
                <tr key={ext.id} className="table-row" style={{ borderBottom: "1px solid #F5F4EF" }}>
                  <td style={{ padding: "11px 1.25rem", fontWeight: "600", color: "#1a1a1a", fontFamily: "monospace", fontSize: "12.5px" }}>{ext.codigo}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#555" }}>{ext.cliente.nombre}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#555" }}>{ext.tipo}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#555" }}>{ext.capacidad}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#777" }}>{ext.ubicacion}</td>
                  <td style={{ padding: "11px 1.25rem", color: "#777" }}>{ext.ultimaMantencion ? new Date(ext.ultimaMantencion).toLocaleDateString("es-CL") : "—"}</td>
                  <td style={{ padding: "11px 1.25rem" }}><Badge estado={ext.estado} dias={ext.diasRestantes} /></td>
                  <td style={{ padding: "11px 1.25rem" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => { setSeleccionado(ext); setModal("editar"); }}
                        style={{ padding: "5px", border: "1px solid #E5E4DC", borderRadius: "6px", background: "#fff", cursor: "pointer", display: "flex" }}>
                        <Pencil size={13} color="#666" />
                      </button>
                      <button onClick={() => { setSeleccionado(ext); setModal("eliminar"); }}
                        style={{ padding: "5px", border: "1px solid #F7C1C1", borderRadius: "6px", background: "#fff", cursor: "pointer", display: "flex" }}>
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
