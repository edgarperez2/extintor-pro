// src/app/admin/extintores/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Extintor {
  id: string;
  codigo: string;
  tipo: string;
  capacidad: string;
  ubicacion: string;
  estado: string;
  diasRestantes: number | null;
  cliente: { nombre: string };
  ultimaMantencion: string | null;
  proximaMantencion: string | null;
}

function Badge({ estado, dias }: { estado: string; dias: number | null }) {
  if (estado === "VENCIDO") return <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Vencido</span>;
  if (estado === "PROXIMO") return <span style={{ background: "#FAEEDA", color: "#633806", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{`Vence en ${dias} días`}</span>;
  if (estado === "AL_DIA") return <span style={{ background: "#EAF3DE", color: "#27500A", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Al día</span>;
  return <span style={{ background: "#F5F4EF", color: "#666", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>Sin mantención</span>;
}

export default function ExtintoresPage() {
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/extintores").then((r) => r.json()).then((data) => { setExtintores(data); setLoading(false); });
  }, []);

  const filtrados = extintores.filter((e) =>
    e.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <div style={{ padding: "2rem", color: "#666", fontSize: "14px" }}>Cargando...</div>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "18px", fontWeight: "500" }}>Extintores</h1>
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar extintor..." style={{ padding: "7px 12px", borderRadius: "8px", border: "0.5px solid #E5E4DC", fontSize: "13px", width: "220px" }} />
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#F5F4EF" }}>
              {["Código", "Cliente", "Tipo", "Capacidad", "Ubicación", "Últ. mantención", "Próx. mantención", "Estado"].map((h) => (
                <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "12px", fontWeight: "500", color: "#666", borderBottom: "0.5px solid #E5E4DC" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>No hay extintores</td></tr>}
            {filtrados.map((ext) => (
              <tr key={ext.id} style={{ borderBottom: "0.5px solid #E5E4DC" }}>
                <td style={{ padding: "10px 1.25rem", fontWeight: "500" }}>{ext.codigo}</td>
                <td style={{ padding: "10px 1.25rem" }}>{ext.cliente.nombre}</td>
                <td style={{ padding: "10px 1.25rem" }}>{ext.tipo}</td>
                <td style={{ padding: "10px 1.25rem" }}>{ext.capacidad}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{ext.ubicacion}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{ext.ultimaMantencion ? new Date(ext.ultimaMantencion).toLocaleDateString("es-CL") : "—"}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{ext.proximaMantencion ? new Date(ext.proximaMantencion).toLocaleDateString("es-CL") : "—"}</td>
                <td style={{ padding: "10px 1.25rem" }}><Badge estado={ext.estado} dias={ext.diasRestantes} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
