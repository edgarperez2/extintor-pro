// src/app/admin/solicitudes/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Solicitud {
  id: string;
  estado: string;
  observaciones: string;
  fechaSolicitada: string | null;
  createdAt: string;
  extintoresIds: string[];
  cliente: { nombre: string; email: string };
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/solicitudes").then((r) => r.json()).then((data) => { setSolicitudes(data); setLoading(false); });
  }, []);

  async function actualizarEstado(id: string, estado: string) {
    await fetch(`/api/solicitudes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setSolicitudes((prev) => prev.map((s) => s.id === id ? { ...s, estado } : s));
  }

  if (loading) return <div style={{ padding: "2rem", color: "#666", fontSize: "14px" }}>Cargando...</div>;

  const pendientes = solicitudes.filter((s) => s.estado === "PENDIENTE");
  const resto = solicitudes.filter((s) => s.estado !== "PENDIENTE");

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "18px", fontWeight: "500", marginBottom: "1.5rem" }}>Solicitudes de mantención</h1>

      {pendientes.length > 0 && (
        <>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#666", marginBottom: "12px" }}>Pendientes ({pendientes.length})</div>
          {pendientes.map((s) => (
            <div key={s.id} style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", padding: "1.25rem", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>{s.cliente.nombre}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>{s.extintoresIds.length} extintor(es) · Solicitado {new Date(s.createdAt).toLocaleDateString("es-CL")}</div>
                {s.observaciones && <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>"{s.observaciones}"</div>}
                {s.fechaSolicitada && <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Fecha preferida: {new Date(s.fechaSolicitada).toLocaleDateString("es-CL")}</div>}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => actualizarEstado(s.id, "ACEPTADA")} style={{ padding: "7px 14px", background: "#E24B4A", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}>Aceptar</button>
                <button onClick={() => actualizarEstado(s.id, "RECHAZADA")} style={{ padding: "7px 14px", background: "transparent", color: "#666", border: "0.5px solid #E5E4DC", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>Rechazar</button>
              </div>
            </div>
          ))}
        </>
      )}

      {pendientes.length === 0 && <div style={{ background: "#EAF3DE", border: "0.5px solid #C0DD97", borderRadius: "8px", padding: "12px 1rem", fontSize: "13px", color: "#27500A", marginBottom: "1.5rem" }}>✓ No hay solicitudes pendientes</div>}

      {resto.length > 0 && (
        <>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#666", marginBottom: "12px", marginTop: "1.5rem" }}>Historial</div>
          <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#F5F4EF" }}>
                  {["Cliente", "Extintores", "Solicitado", "Estado"].map((h) => (
                    <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "12px", fontWeight: "500", color: "#666", borderBottom: "0.5px solid #E5E4DC" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resto.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "0.5px solid #E5E4DC" }}>
                    <td style={{ padding: "10px 1.25rem" }}>{s.cliente.nombre}</td>
                    <td style={{ padding: "10px 1.25rem", color: "#666" }}>{s.extintoresIds.length}</td>
                    <td style={{ padding: "10px 1.25rem", color: "#666" }}>{new Date(s.createdAt).toLocaleDateString("es-CL")}</td>
                    <td style={{ padding: "10px 1.25rem" }}>
                      <span style={{ background: s.estado === "ACEPTADA" ? "#EAF3DE" : "#FCEBEB", color: s.estado === "ACEPTADA" ? "#27500A" : "#791F1F", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{s.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
