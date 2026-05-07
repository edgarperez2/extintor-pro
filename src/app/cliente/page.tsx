"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Extintor {
  id: string;
  codigo: string;
  tipo: string;
  capacidad: string;
  ubicacion: string;
  estado: string;
  diasRestantes: number | null;
  ultimaMantencion: string | null;
  proximaMantencion: string | null;
}

function EstadoBanner({ extintores }: { extintores: Extintor[] }) {
  const vencidos = extintores.filter(e => e.estado === "VENCIDO").length;
  const proximos = extintores.filter(e => e.estado === "PROXIMO").length;
  if (vencidos === 0 && proximos === 0) return null;
  return (
    <div style={{ background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: "8px", padding: "12px 1rem", marginBottom: "1.5rem", fontSize: "13px", color: "#633806", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>⚠ {vencidos > 0 && <strong>{vencidos} extintor(es) vencido(s)</strong>}{vencidos > 0 && proximos > 0 && " y "}{proximos > 0 && <strong>{proximos} próximo(s) a vencer</strong>}. Solicita mantención para regularizarlos.</span>
      <Link href="/cliente/solicitar" style={{ color: "#633806", fontWeight: "500", fontSize: "12px", textDecoration: "none" }}>Solicitar →</Link>
    </div>
  );
}

function BadgeEstado({ estado, dias }: { estado: string; dias: number | null }) {
  if (estado === "VENCIDO") return <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Vencido</span>;
  if (estado === "PROXIMO") return <span style={{ background: "#FAEEDA", color: "#633806", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Vence en {dias} días</span>;
  if (estado === "AL_DIA") return <span style={{ background: "#EAF3DE", color: "#27500A", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "500" }}>Al día</span>;
  return <span style={{ background: "#F5F4EF", color: "#666", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>Sin mantención</span>;
}

function ProgressBar({ estado, dias }: { estado: string; dias: number | null }) {
  let pct = 50; let color = "#639922";
  if (estado === "VENCIDO") { pct = 100; color = "#E24B4A"; }
  else if (estado === "PROXIMO") { pct = 85; color = "#BA7517"; }
  else if (estado === "AL_DIA" && dias !== null) { pct = Math.max(10, Math.min(80, Math.round((365 - dias) / 365 * 100))); }
  return (
    <div style={{ height: "4px", background: "#F5F4EF", borderRadius: "2px", marginTop: "10px", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px" }} />
    </div>
  );
}

export default function ClienteDashboard() {
  const { data: session } = useSession();
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clienteId = (session?.user as any)?.clienteId;
    if (!clienteId) return;
    fetch(`/api/extintores?clienteId=${clienteId}`)
      .then(r => r.json())
      .then(data => { setExtintores(data); setLoading(false); });
  }, [session]);

  if (loading) return <div style={{ padding: "2rem", color: "#666", fontSize: "14px" }}>Cargando...</div>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "18px", fontWeight: "500", marginBottom: "1.5rem" }}>Mis extintores</h1>
      <EstadoBanner extintores={extintores} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {extintores.length === 0 && <div style={{ gridColumn: "1/-1", padding: "2rem", textAlign: "center", color: "#666", background: "#fff", borderRadius: "12px", border: "0.5px solid #E5E4DC" }}>No hay extintores registrados</div>}
        {extintores.map(ext => (
          <div key={ext.id} style={{ background: "#fff", border: `0.5px solid ${ext.estado === "VENCIDO" ? "#F7C1C1" : "#E5E4DC"}`, borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "500" }}>{ext.codigo}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{ext.tipo} · {ext.capacidad}</div>
              </div>
              <BadgeEstado estado={ext.estado} dias={ext.diasRestantes} />
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>📍 {ext.ubicacion}</div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Última mantención: {ext.ultimaMantencion ? new Date(ext.ultimaMantencion).toLocaleDateString("es-CL") : "—"}</div>
            <div style={{ fontSize: "12px", fontWeight: "500", color: ext.estado === "VENCIDO" ? "#791F1F" : ext.estado === "PROXIMO" ? "#633806" : "#27500A" }}>
              {ext.estado === "VENCIDO" ? `Venció: ${ext.proximaMantencion ? new Date(ext.proximaMantencion).toLocaleDateString("es-CL") : "—"}` : `Vence: ${ext.proximaMantencion ? new Date(ext.proximaMantencion).toLocaleDateString("es-CL") : "—"}`}
            </div>
            <ProgressBar estado={ext.estado} dias={ext.diasRestantes} />
          </div>
        ))}
      </div>
      {extintores.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/cliente/solicitar" style={{ padding: "9px 18px", background: "#E24B4A", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>
            Solicitar mantención ↗
          </Link>
        </div>
      )}
    </div>
  );
}
