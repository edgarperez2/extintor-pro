"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Flame, AlertTriangle, AlertOctagon, ArrowRight, ChevronRight } from "lucide-react";

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

function ExtintorDecorativo() {
  return (
    <svg width="70" height="112" viewBox="0 0 60 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.18 }}>
      <rect x="14" y="38" width="32" height="54" rx="16" fill="white" />
      <rect x="21" y="22" width="18" height="20" rx="5" fill="white" />
      <rect x="16" y="16" width="28" height="9" rx="4.5" fill="white" />
      <rect x="7" y="17" width="13" height="4" rx="2" fill="white" />
      <rect x="7" y="17" width="4" height="13" rx="2" fill="white" />
      <path d="M46 56 C58 56 58 70 46 70" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="37" y="67" width="13" height="6" rx="3" fill="white" />
      <circle cx="30" cy="62" r="8" stroke="white" strokeWidth="1.5" fillOpacity="0" />
      <rect x="19" y="44" width="5" height="32" rx="2.5" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

function BadgeEstado({ estado, dias }: { estado: string; dias: number }) {
  if (estado === "VENCIDO") return <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "500", whiteSpace: "nowrap" }}>Vencido hace {Math.abs(dias)} días</span>;
  if (estado === "PROXIMO") return <span style={{ background: "#FAEEDA", color: "#633806", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "500", whiteSpace: "nowrap" }}>Vence en {dias} días</span>;
  return <span style={{ background: "#EAF3DE", color: "#27500A", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "500" }}>Al día</span>;
}

function SkeletonDashboard() {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #E24B4A, #9B2020)", height: "120px", marginBottom: "1.75rem" }} className="skeleton" />
      <div style={{ padding: "0 2rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "1.75rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <div className="skeleton" style={{ height: "13px", width: "90px" }} />
                <div className="skeleton" style={{ height: "32px", width: "32px", borderRadius: "8px" }} />
              </div>
              <div className="skeleton" style={{ height: "30px", width: "60px" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

  if (loading) return <SkeletonDashboard />;

  const metrics = [
    { label: "Clientes activos", value: resumen?.totalClientes, icon: Users, iconBg: "#EEF2FF", iconColor: "#4F6FD0", valueColor: "#1a1a1a" },
    { label: "Extintores", value: resumen?.totalExtintores, icon: Flame, iconBg: "#FEF2F2", iconColor: "#E24B4A", valueColor: "#1a1a1a" },
    { label: "Vencen pronto", value: resumen?.proximosAVencer, icon: AlertTriangle, iconBg: "#FEF3E2", iconColor: "#BA7517", valueColor: "#854F0B" },
    { label: "Vencidos", value: resumen?.vencidos, icon: AlertOctagon, iconBg: "#FCEBEB", iconColor: "#C0392B", valueColor: "#A32D2D" },
  ];

  return (
    <div>
      {/* Gradient header */}
      <div style={{ background: "linear-gradient(135deg, #E24B4A 0%, #B22020 60%, #7A1010 100%)", padding: "1.75rem 2rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "80px", top: "-10px" }}>
          <ExtintorDecorativo />
        </div>
        <div style={{ position: "absolute", right: "180px", bottom: "-20px", transform: "scale(0.7)", transformOrigin: "bottom right" }}>
          <ExtintorDecorativo />
        </div>
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Panel de control</p>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", letterSpacing: "-0.02em", marginBottom: "0" }}>Resumen general</h1>
        </div>
      </div>

      <div style={{ padding: "0 2rem 2rem", marginTop: "-1rem" }}>
        {/* Metric cards — overlap the header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="card-hover" style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", padding: "1.25rem", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <span style={{ fontSize: "12.5px", color: "#888" }}>{m.label}</span>
                  <div style={{ width: "32px", height: "32px", background: m.iconBg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={15} color={m.iconColor} strokeWidth={2} />
                  </div>
                </div>
                <div style={{ fontSize: "30px", fontWeight: "700", color: m.valueColor, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {m.value ?? 0}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending requests banner */}
        {resumen && resumen.solicitudesPendientes > 0 && (
          <div style={{ background: "#FEF3E2", border: "1px solid #F6C965", borderRadius: "10px", padding: "11px 1rem", marginBottom: "1.25rem", fontSize: "13px", color: "#633806", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠ Tienes <strong>{resumen.solicitudesPendientes} solicitud{resumen.solicitudesPendientes > 1 ? "es" : ""} pendiente{resumen.solicitudesPendientes > 1 ? "s" : ""}</strong> de clientes.</span>
            <Link href="/admin/solicitudes" style={{ color: "#633806", fontWeight: "600", fontSize: "12px", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}>
              Ver solicitudes <ChevronRight size={13} />
            </Link>
          </div>
        )}

        {/* Upcoming maintenance table */}
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "14px 1.5rem", borderBottom: "1px solid #EBEBEB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>Próximas mantenciones</span>
            <Link href="/admin/mantenciones" style={{ fontSize: "12.5px", color: "#888", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}>
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAF8" }}>
                {["Cliente", "Extintor", "Ubicación", "Próxima fecha", "Estado"].map((h) => (
                  <th key={h} style={{ padding: "10px 1.5rem", textAlign: "left", fontSize: "11.5px", fontWeight: "500", color: "#999", borderBottom: "1px solid #EBEBEB", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proximas.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "14px" }}>Sin mantenciones próximas</td></tr>
              )}
              {proximas.map((ext) => (
                <tr key={ext.id} className="table-row" style={{ borderBottom: "1px solid #F5F4EF" }}>
                  <td style={{ padding: "11px 1.5rem", fontSize: "13.5px", color: "#555" }}>{ext.cliente.nombre}</td>
                  <td style={{ padding: "11px 1.5rem", fontSize: "13.5px", fontWeight: "500", color: "#1a1a1a" }}>{ext.codigo}</td>
                  <td style={{ padding: "11px 1.5rem", fontSize: "13.5px", color: "#777" }}>{ext.ubicacion}</td>
                  <td style={{ padding: "11px 1.5rem", fontSize: "13.5px", color: "#777" }}>
                    {ext.mantenciones[0] ? new Date(ext.mantenciones[0].proximaFecha).toLocaleDateString("es-CL") : "—"}
                  </td>
                  <td style={{ padding: "11px 1.5rem" }}>
                    <BadgeEstado estado={ext.estado} dias={ext.dias} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
