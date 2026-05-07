// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Resumen {
  totalClientes: number;
  totalExtintores: number;
  solicitudesPendientes: number;
  vencidos: number;
  proximosAVencer: number;
}

interface ProximaMantencion {
  id: string;
  codigo: string;
  ubicacion: string;
  dias: number;
  estado: string;
  cliente: { nombre: string };
  mantenciones: { proximaFecha: string }[];
}

function badge(type: "ok" | "warn" | "danger"): React.CSSProperties {
  const styles = {
    ok: { background: "#EAF3DE", color: "#27500A" },
    warn: { background: "#FAEEDA", color: "#633806" },
    danger: { background: "#FCEBEB", color: "#791F1F" },
  };
  return { ...styles[type], padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" as const };
}

export default function AdminDashboard() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [proximas, setProximas] = useState<ProximaMantencion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then((data) => {
      setResumen(data.resumen);
      setProximas(data.proximasMantenciones);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: "2rem", color: "#666", fontSize: "14px" }}>Cargando...</div>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "18px", fontWeight: "500", marginBottom: "1.5rem" }}>Resumen general</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "1.5rem" }}>
        {[
          { label: "Clientes activos", value: resumen?.totalClientes, color: "#1a1a1a" },
          { label: "Extintores", value: resumen?.totalExtintores, color: "#1a1a1a" },
          { label: "Vencen pronto", value: resumen?.proximosAVencer, color: "#854F0B" },
          { label: "Vencidos", value: resumen?.vencidos, color: "#A32D2D" },
        ].map((m) => (
          <div key={m.label} style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>{m.label}</div>
            <div style={{ fontSize: "24px", fontWeight: "500", color: m.color }}>{m.value ?? 0}</div>
          </div>
        ))}
      </div>
      {resumen && resumen.solicitudesPendientes > 0 && (
        <div style={{ background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: "8px", padding: "12px 1rem", marginBottom: "1rem", fontSize: "13px", color: "#633806", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠ Tienes <strong>{resumen.solicitudesPendientes} solicitud(es) pendiente(s)</strong> de clientes.</span>
          <Link href="/admin/solicitudes" style={{ color: "#633806", fontWeight: "500", fontSize: "12px" }}>Ver solicitudes →</Link>
        </div>
      )}
      <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "12px 1.25rem", borderBottom: "0.5px solid #E5E4DC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>Próximas mantenciones</span>
          <Link href="/admin/mantenciones" style={{ fontSize: "12px", color: "#666", textDecoration: "none" }}>Ver todas →</Link>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#F5F4EF" }}>
              {["Cliente", "Extintor", "Ubicación", "Próxima fecha", "Estado"].map((h) => (
                <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "12px", fontWeight: "500", color: "#666", borderBottom: "0.5px solid #E5E4DC" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {proximas.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>Sin mantenciones próximas</td></tr>
            )}
            {proximas.map((ext) => (
              <tr key={ext.id} style={{ borderBottom: "0.5px solid #E5E4DC" }}>
                <td style={{ padding: "10px 1.25rem" }}>{ext.cliente.nombre}</td>
                <td style={{ padding: "10px 1.25rem", fontWeight: "500" }}>{ext.codigo}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{ext.ubicacion}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{ext.mantenciones[0] ? new Date(ext.mantenciones[0].proximaFecha).toLocaleDateString("es-CL") : "—"}</td>
                <td style={{ padding: "10px 1.25rem" }}>
                  {ext.estado === "VENCIDO" && <span style={badge("danger")}>{`Vencido hace ${Math.abs(ext.dias)} días`}</span>}
                  {ext.estado === "PROXIMO" && <span style={badge("warn")}>{`Vence en ${ext.dias} días`}</span>}
                  {ext.estado === "AL_DIA" && <span style={badge("ok")}>Al día</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
