// src/app/admin/clientes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Extintor {
  id: string;
  codigo: string;
  tipo: string;
  capacidad: string;
  ubicacion: string;
  mantenciones: { fecha: string; proximaFecha: string; tecnico: string; estado: string }[];
}

interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  extintores: Extintor[];
}

function calcEstado(mantenciones: Extintor["mantenciones"]) {
  if (!mantenciones.length) return { estado: "SIN_MANTENCION", dias: null };
  const proxima = new Date(mantenciones[0].proximaFecha);
  const dias = Math.round((proxima.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return { estado: "VENCIDO", dias };
  if (dias <= 30) return { estado: "PROXIMO", dias };
  return { estado: "AL_DIA", dias };
}

function Badge({ estado, dias }: { estado: string; dias: number | null }) {
  if (estado === "VENCIDO") return <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Vencido</span>;
  if (estado === "PROXIMO") return <span style={{ background: "#FAEEDA", color: "#633806", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{`${dias} días`}</span>;
  if (estado === "AL_DIA") return <span style={{ background: "#EAF3DE", color: "#27500A", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Al día</span>;
  return <span style={{ background: "#F5F4EF", color: "#666", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Sin mantención</span>;
}

export default function ClienteDetallePage() {
  const { id } = useParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clientes/${id}`).then((r) => r.json()).then((data) => { setCliente(data); setLoading(false); });
  }, [id]);

  if (loading) return <div style={{ padding: "2rem", color: "#666", fontSize: "14px" }}>Cargando...</div>;
  if (!cliente) return <div style={{ padding: "2rem", color: "#666" }}>Cliente no encontrado</div>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
        <Link href="/admin/clientes" style={{ fontSize: "13px", color: "#666", textDecoration: "none", padding: "5px 10px", border: "0.5px solid #E5E4DC", borderRadius: "6px" }}>← Volver</Link>
        <h1 style={{ fontSize: "18px", fontWeight: "500" }}>{cliente.nombre}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#666", marginBottom: "1rem" }}>Datos del cliente</div>
          {[["RUT", cliente.rut], ["Email", cliente.email], ["Teléfono", cliente.telefono || "—"], ["Dirección", cliente.direccion || "—"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #F5F4EF", fontSize: "13px" }}>
              <span style={{ color: "#666" }}>{k}</span>
              <span style={{ fontWeight: "500" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#666", marginBottom: "1rem" }}>Resumen</div>
          <div style={{ fontSize: "32px", fontWeight: "500", marginBottom: "4px" }}>{cliente.extintores.length}</div>
          <div style={{ fontSize: "13px", color: "#666" }}>extintores registrados</div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "12px 1.25rem", borderBottom: "0.5px solid #E5E4DC" }}>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>Extintores</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#F5F4EF" }}>
              {["Código", "Tipo", "Capacidad", "Ubicación", "Últ. mantención", "Próx. mantención", "Estado"].map((h) => (
                <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "12px", fontWeight: "500", color: "#666", borderBottom: "0.5px solid #E5E4DC" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cliente.extintores.map((ext) => {
              const { estado, dias } = calcEstado(ext.mantenciones);
              const ultima = ext.mantenciones[0];
              return (
                <tr key={ext.id} style={{ borderBottom: "0.5px solid #E5E4DC" }}>
                  <td style={{ padding: "10px 1.25rem", fontWeight: "500" }}>{ext.codigo}</td>
                  <td style={{ padding: "10px 1.25rem" }}>{ext.tipo}</td>
                  <td style={{ padding: "10px 1.25rem" }}>{ext.capacidad}</td>
                  <td style={{ padding: "10px 1.25rem", color: "#666" }}>{ext.ubicacion}</td>
                  <td style={{ padding: "10px 1.25rem", color: "#666" }}>{ultima ? new Date(ultima.fecha).toLocaleDateString("es-CL") : "—"}</td>
                  <td style={{ padding: "10px 1.25rem", color: "#666" }}>{ultima ? new Date(ultima.proximaFecha).toLocaleDateString("es-CL") : "—"}</td>
                  <td style={{ padding: "10px 1.25rem" }}><Badge estado={estado} dias={dias} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
