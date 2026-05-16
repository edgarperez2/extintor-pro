"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MapPin, Clock, CalendarCheck, ChevronRight } from "lucide-react";

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

function BadgeEstado({ estado, dias }: { estado: string; dias: number | null }) {
  if (estado === "VENCIDO") return (
    <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "500" }}>Vencido</span>
  );
  if (estado === "PROXIMO") return (
    <span style={{ background: "#FAEEDA", color: "#633806", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "500" }}>Vence en {dias} días</span>
  );
  if (estado === "AL_DIA") return (
    <span style={{ background: "#EAF3DE", color: "#27500A", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "500" }}>Al día</span>
  );
  return (
    <span style={{ background: "#F5F4EF", color: "#888", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px" }}>Sin mantención</span>
  );
}

function ProgressBar({ estado, dias }: { estado: string; dias: number | null }) {
  let pct = 50;
  let color = "#639922";
  if (estado === "VENCIDO") { pct = 100; color = "#E24B4A"; }
  else if (estado === "PROXIMO") { pct = 82; color = "#BA7517"; }
  else if (estado === "AL_DIA" && dias !== null) {
    pct = Math.max(8, Math.min(75, Math.round((365 - dias) / 365 * 100)));
  }
  return (
    <div style={{ height: "3px", background: "#F0EFEA", borderRadius: "2px", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px" }} />
    </div>
  );
}

function EstadoBanner({ extintores }: { extintores: Extintor[] }) {
  const vencidos = extintores.filter(e => e.estado === "VENCIDO").length;
  const proximos = extintores.filter(e => e.estado === "PROXIMO").length;
  if (vencidos === 0 && proximos === 0) return null;
  return (
    <div style={{ background: "#FEF3E2", border: "1px solid #F6C965", borderRadius: "10px", padding: "12px 1rem", marginBottom: "1.5rem", fontSize: "13px", color: "#633806", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>
        ⚠{" "}
        {vencidos > 0 && <strong>{vencidos} extintor{vencidos > 1 ? "es" : ""} vencido{vencidos > 1 ? "s" : ""}</strong>}
        {vencidos > 0 && proximos > 0 && " y "}
        {proximos > 0 && <strong>{proximos} próximo{proximos > 1 ? "s" : ""} a vencer</strong>}
        . Solicita mantención para regularizarlos.
      </span>
      <Link href="/cliente/solicitar" style={{ color: "#633806", fontWeight: "600", fontSize: "12px", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap", marginLeft: "1rem" }}>
        Solicitar <ChevronRight size={13} />
      </Link>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div style={{ padding: "2rem" }}>
      <div className="skeleton" style={{ height: "22px", width: "160px", marginBottom: "1.75rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <div className="skeleton" style={{ height: "15px", width: "80px", marginBottom: "6px" }} />
                <div className="skeleton" style={{ height: "12px", width: "100px" }} />
              </div>
              <div className="skeleton" style={{ height: "22px", width: "60px", borderRadius: "5px" }} />
            </div>
            <div className="skeleton" style={{ height: "12px", width: "130px", marginBottom: "6px" }} />
            <div className="skeleton" style={{ height: "12px", width: "110px", marginBottom: "6px" }} />
            <div className="skeleton" style={{ height: "12px", width: "120px", marginBottom: "12px" }} />
            <div className="skeleton" style={{ height: "3px", width: "100%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function tipoLabel(tipo: string) {
  const map: Record<string, string> = { CO2: "CO₂", PQS: "PQS", AGUA: "Agua", ESPUMA: "Espuma", HCFC: "HCFC" };
  return map[tipo] ?? tipo;
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

  if (loading) return <SkeletonCards />;

  const borderColor = (estado: string) =>
    estado === "VENCIDO" ? "#F7C1C1" : estado === "PROXIMO" ? "#F6D894" : "#EBEBEB";

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", letterSpacing: "-0.01em" }}>
          Mis extintores
        </h1>
        {extintores.length > 0 && (
          <Link href="/cliente/solicitar" className="btn-primary" style={{ padding: "8px 16px", background: "#E24B4A", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
            Solicitar mantención <ChevronRight size={14} />
          </Link>
        )}
      </div>

      <EstadoBanner extintores={extintores} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {extintores.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "14px", background: "#fff", borderRadius: "14px", border: "1px solid #EBEBEB" }}>
            No hay extintores registrados
          </div>
        )}
        {extintores.map(ext => (
          <div key={ext.id} className="card-hover" style={{ background: "#fff", border: `1px solid ${borderColor(ext.estado)}`, borderRadius: "14px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a", letterSpacing: "-0.01em" }}>{ext.codigo}</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{tipoLabel(ext.tipo)} · {ext.capacidad}</div>
              </div>
              <BadgeEstado estado={ext.estado} dias={ext.diasRestantes} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "#777" }}>
                <MapPin size={12} color="#bbb" strokeWidth={2} />
                {ext.ubicacion}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "#777" }}>
                <Clock size={12} color="#bbb" strokeWidth={2} />
                Última: {ext.ultimaMantencion ? new Date(ext.ultimaMantencion).toLocaleDateString("es-CL") : "—"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "500", color: ext.estado === "VENCIDO" ? "#791F1F" : ext.estado === "PROXIMO" ? "#633806" : "#27500A" }}>
                <CalendarCheck size={12} strokeWidth={2} color={ext.estado === "VENCIDO" ? "#E24B4A" : ext.estado === "PROXIMO" ? "#BA7517" : "#639922"} />
                {ext.estado === "VENCIDO" ? "Venció: " : "Vence: "}
                {ext.proximaMantencion ? new Date(ext.proximaMantencion).toLocaleDateString("es-CL") : "—"}
              </div>
            </div>
            <ProgressBar estado={ext.estado} dias={ext.diasRestantes} />
          </div>
        ))}
      </div>
    </div>
  );
}
