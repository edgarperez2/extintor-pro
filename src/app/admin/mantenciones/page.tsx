// src/app/admin/mantenciones/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Mantencion {
  id: string;
  fecha: string;
  proximaFecha: string;
  tecnico: string;
  estado: string;
  extintor: { codigo: string; tipo: string; capacidad: string; cliente: { nombre: string } };
}

export default function MantencionesPage() {
  const [mantenciones, setMantenciones] = useState<Mantencion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mantenciones").then((r) => r.json()).then((data) => { setMantenciones(data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: "2rem", color: "#666", fontSize: "14px" }}>Cargando...</div>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "18px", fontWeight: "500", marginBottom: "1.5rem" }}>Mantenciones</h1>
      <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#F5F4EF" }}>
              {["Cliente", "Extintor", "Fecha realizada", "Próxima fecha", "Técnico", "Estado"].map((h) => (
                <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "12px", fontWeight: "500", color: "#666", borderBottom: "0.5px solid #E5E4DC" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mantenciones.length === 0 && <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>No hay mantenciones registradas</td></tr>}
            {mantenciones.map((m) => (
              <tr key={m.id} style={{ borderBottom: "0.5px solid #E5E4DC" }}>
                <td style={{ padding: "10px 1.25rem" }}>{m.extintor.cliente.nombre}</td>
                <td style={{ padding: "10px 1.25rem", fontWeight: "500" }}>{m.extintor.codigo}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{new Date(m.fecha).toLocaleDateString("es-CL")}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{new Date(m.proximaFecha).toLocaleDateString("es-CL")}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{m.tecnico || "—"}</td>
                <td style={{ padding: "10px 1.25rem" }}>
                  <span style={{ background: m.estado === "COMPLETADA" ? "#EAF3DE" : "#FAEEDA", color: m.estado === "COMPLETADA" ? "#27500A" : "#633806", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{m.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
