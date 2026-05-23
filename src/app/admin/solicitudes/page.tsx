"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle } from "lucide-react";

interface Solicitud {
  id: string;
  estado: string;
  observaciones: string;
  fechaSolicitada: string | null;
  createdAt: string;
  extintoresIds: string[];
  cliente: { nombre: string; email: string };
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

function AceptarModal({ solicitud, onClose, onAceptada }: { solicitud: Solicitud; onClose: () => void; onAceptada: () => void }) {
  const [fecha, setFecha] = useState(solicitud.fechaSolicitada ? solicitud.fechaSolicitada.split("T")[0] : new Date().toISOString().split("T")[0]);
  const [tecnico, setTecnico] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fecha) { setError("La fecha es obligatoria"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/solicitudes/${solicitud.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "ACEPTADA", fecha, tecnico, observaciones }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); setSaving(false); return; }
      onAceptada(); onClose();
    } catch {
      setError("Error de conexión"); setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #27AE60, #1E8449)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle size={18} color="#fff" />
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>Aceptar solicitud</span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <div style={{ padding: "1.25rem 1.5rem 0.5rem", background: "#F9FFF9", borderBottom: "1px solid #E0F0E0" }}>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
            Cliente: <strong>{solicitud.cliente.nombre}</strong> · {solicitud.extintoresIds.length} extintor(es)
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Fecha de mantención *</label>
            <input type="date" style={inputStyle} value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Técnico asignado</label>
            <input style={inputStyle} value={tecnico} onChange={e => setTecnico(e.target.value)} placeholder="Nombre del técnico" />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Observaciones</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Notas al cliente..." />
          </div>

          <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
            Se crearán mantenciones COMPLETADA para cada extintor con fecha próxima en 1 año.
          </p>

          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #27AE60, #1E8449)", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Procesando..." : "Confirmar y aceptar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function estadoBadge(estado: string) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PENDIENTE:  { bg: "#FEF3E2", color: "#633806", label: "Pendiente" },
    ACEPTADA:   { bg: "#EAF3DE", color: "#27500A", label: "Aceptada" },
    RECHAZADA:  { bg: "#FCEBEB", color: "#791F1F", label: "Rechazada" },
    COMPLETADA: { bg: "#EEF2FF", color: "#3730A3", label: "Completada" },
  };
  const s = map[estado] ?? { bg: "#F5F4EF", color: "#666", label: estado };
  return <span style={{ background: s.bg, color: s.color, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{s.label}</span>;
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [aceptarModal, setAceptarModal] = useState<Solicitud | null>(null);

  function cargar() {
    return fetch("/api/solicitudes").then(r => r.json()).then(data => { setSolicitudes(data); setLoading(false); });
  }

  useEffect(() => { cargar(); }, []);

  async function rechazar(s: Solicitud) {
    if (!confirm(`¿Rechazar la solicitud de ${s.cliente.nombre}? Esta acción notificará al cliente.`)) return;
    await fetch(`/api/solicitudes/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "RECHAZADA" }),
    });
    setSolicitudes(prev => prev.map(x => x.id === s.id ? { ...x, estado: "RECHAZADA" } : x));
  }

  if (loading) return (
    <div style={{ padding: "2rem" }}>
      {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "12px", marginBottom: "12px" }} />)}
    </div>
  );

  const pendientes = solicitudes.filter(s => s.estado === "PENDIENTE");
  const historial = solicitudes.filter(s => s.estado !== "PENDIENTE");

  return (
    <>
      {aceptarModal && (
        <AceptarModal
          solicitud={aceptarModal}
          onClose={() => setAceptarModal(null)}
          onAceptada={() => { cargar(); setAceptarModal(null); }}
        />
      )}

      <div style={{ padding: "1.5rem" }}>
        <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "1.5rem" }}>Solicitudes de mantención</h1>

        {/* Pending */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
            Pendientes ({pendientes.length})
          </div>

          {pendientes.length === 0 && (
            <div style={{ background: "#EAF3DE", border: "1px solid #C0DD97", borderRadius: "10px", padding: "12px 1rem", fontSize: "13px", color: "#27500A" }}>
              ✓ No hay solicitudes pendientes
            </div>
          )}

          {pendientes.map(s => (
            <div key={s.id} style={{ background: "#fff", border: "1px solid #F6C965", borderRadius: "12px", padding: "1.25rem", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", boxShadow: "0 2px 8px rgba(246,201,101,0.15)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14.5px", fontWeight: "600", color: "#1a1a1a", marginBottom: "4px" }}>{s.cliente.nombre}</div>
                <div style={{ fontSize: "12.5px", color: "#777", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span>{s.extintoresIds.length} extintor(es)</span>
                  <span>Solicitado: {new Date(s.createdAt).toLocaleDateString("es-CL")}</span>
                  {s.fechaSolicitada && <span>Fecha preferida: {new Date(s.fechaSolicitada).toLocaleDateString("es-CL")}</span>}
                </div>
                {s.observaciones && (
                  <div style={{ fontSize: "12.5px", color: "#888", marginTop: "6px", fontStyle: "italic" }}>"{s.observaciones}"</div>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", marginLeft: "1rem", flexShrink: 0 }}>
                <button
                  onClick={() => setAceptarModal(s)}
                  style={{ padding: "8px 16px", background: "linear-gradient(135deg, #27AE60, #1E8449)", color: "#fff", border: "none", borderRadius: "7px", fontSize: "12.5px", cursor: "pointer", fontWeight: "600", fontFamily: "inherit" }}>
                  Aceptar
                </button>
                <button
                  onClick={() => rechazar(s)}
                  style={{ padding: "8px 14px", background: "#fff", color: "#666", border: "1px solid #E5E4DC", borderRadius: "7px", fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit" }}>
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        {historial.length > 0 && (
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
              Historial
            </div>
            <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#FAFAF8" }}>
                    {["Cliente", "Extintores", "Solicitado", "Estado"].map(h => (
                      <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "11.5px", fontWeight: "500", color: "#999", borderBottom: "1px solid #EBEBEB", textTransform: "uppercase", letterSpacing: "0.02em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historial.map(s => (
                    <tr key={s.id} className="table-row" style={{ borderBottom: "1px solid #F5F4EF" }}>
                      <td style={{ padding: "11px 1.25rem", color: "#555" }}>{s.cliente.nombre}</td>
                      <td style={{ padding: "11px 1.25rem", color: "#777" }}>{s.extintoresIds.length}</td>
                      <td style={{ padding: "11px 1.25rem", color: "#777" }}>{new Date(s.createdAt).toLocaleDateString("es-CL")}</td>
                      <td style={{ padding: "11px 1.25rem" }}>{estadoBadge(s.estado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
