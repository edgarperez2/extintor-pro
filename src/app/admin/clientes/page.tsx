// src/app/admin/clientes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  resumen: { total: number; vencidos: number; proximos: number; alDia: number };
}

function badge(type: "ok" | "warn" | "danger", text: string) {
  const styles: Record<string, React.CSSProperties> = {
    ok: { background: "#EAF3DE", color: "#27500A" },
    warn: { background: "#FAEEDA", color: "#633806" },
    danger: { background: "#FCEBEB", color: "#791F1F" },
  };
  return <span style={{ ...styles[type], padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>{text}</span>;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/clientes").then((r) => r.json()).then((data) => { setClientes(data); setLoading(false); });
  }, []);

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.rut.includes(busqueda) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <div style={{ padding: "2rem", color: "#666", fontSize: "14px" }}>Cargando...</div>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "18px", fontWeight: "500" }}>Clientes</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar cliente..." style={{ padding: "7px 12px", borderRadius: "8px", border: "0.5px solid #E5E4DC", fontSize: "13px", width: "220px" }} />
        </div>
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#F5F4EF" }}>
              {["Cliente", "RUT", "Email", "Extintores", "Estado", ""].map((h) => (
                <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "12px", fontWeight: "500", color: "#666", borderBottom: "0.5px solid #E5E4DC" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>No hay clientes</td></tr>
            )}
            {filtrados.map((c) => (
              <tr key={c.id} style={{ borderBottom: "0.5px solid #E5E4DC" }}>
                <td style={{ padding: "10px 1.25rem", fontWeight: "500" }}>{c.nombre}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{c.rut}</td>
                <td style={{ padding: "10px 1.25rem", color: "#666" }}>{c.email}</td>
                <td style={{ padding: "10px 1.25rem" }}>{c.resumen.total}</td>
                <td style={{ padding: "10px 1.25rem" }}>
                  {c.resumen.vencidos > 0 && badge("danger", `${c.resumen.vencidos} vencido(s)`)}
                  {c.resumen.vencidos === 0 && c.resumen.proximos > 0 && badge("warn", `${c.resumen.proximos} próximo(s)`)}
                  {c.resumen.vencidos === 0 && c.resumen.proximos === 0 && badge("ok", "Al día")}
                </td>
                <td style={{ padding: "10px 1.25rem" }}>
                  <Link href={`/admin/clientes/${c.id}`} style={{ fontSize: "12px", color: "#666", textDecoration: "none", padding: "5px 10px", border: "0.5px solid #E5E4DC", borderRadius: "6px" }}>Ver detalle →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
