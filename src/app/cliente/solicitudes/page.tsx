"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Solicitud {
  id: string;
  estado: string;
  observaciones: string | null;
  fechaSolicitada: string | null;
  createdAt: string;
  extintoresIds: string[];
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PENDIENTE:  { bg: "#FEF3E2", color: "#633806", label: "Pendiente — esperando confirmacion" },
    ACEPTADA:   { bg: "#EAF3DE", color: "#27500A", label: "Aceptada" },
    RECHAZADA:  { bg: "#FCEBEB", color: "#791F1F", label: "Rechazada" },
    COMPLETADA: { bg: "#EEF2FF", color: "#3730A3", label: "Completada" },
  };
  const s = map[estado] ?? { bg: "#F5F4EF", color: "#666", label: estado };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "500" }}>
      {s.label}
    </span>
  );
}

export default function MisSolicitudesPage() {
  const { data: session } = useSession();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clienteId = (session?.user as any)?.clienteId;
    if (!clienteId) return;
    fetch(`/api/solicitudes?clienteId=${clienteId}`)
      .then(r => r.json())
      .then(data => { setSolicitudes(data); setLoading(false); });
  }, [session]);

  if (loading) return (
    <div style={{ padding: "2rem" }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "12px", marginBottom: "10px" }} />
      ))}
    </div>
  );

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>Mis solicitudes</h1>
        <Link href="/cliente/solicitar" className="btn-primary" style={{ padding: "8px 16px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 3px 10px rgba(226,75,74,0.35)" }}>
          Nueva solicitud <ChevronRight size={14} />
        </Link>
      </div>

      {solicitudes.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", padding: "3rem", textAlign: "center" }}>
          <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "1rem" }}>No has realizado ninguna solicitud aun</p>
          <Link href="/cliente/solicitar" style={{ color: "#E24B4A", fontWeight: "500", fontSize: "13.5px", textDecoration: "none" }}>
            Solicitar mantención →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {solicitudes.map(s => (
            <div key={s.id} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "12px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <EstadoBadge estado={s.estado} />
                </div>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12.5px", color: "#777" }}>
                  <span>{s.extintoresIds.length} extintor{s.extintoresIds.length !== 1 ? "es" : ""} solicitado{s.extintoresIds.length !== 1 ? "s" : ""}</span>
                  <span>Enviada: {new Date(s.createdAt).toLocaleDateString("es-CL")}</span>
                  {s.fechaSolicitada && (
                    <span>Fecha preferida: {new Date(s.fechaSolicitada).toLocaleDateString("es-CL")}</span>
                  )}
                </div>
                {s.observaciones && (
                  <p style={{ fontSize: "12.5px", color: "#888", marginTop: "6px", fontStyle: "italic" }}>"{s.observaciones}"</p>
                )}
              </div>
              {s.estado === "PENDIENTE" && (
                <div style={{ flexShrink: 0, fontSize: "11.5px", color: "#BA7517", background: "#FEF3E2", padding: "5px 10px", borderRadius: "6px", whiteSpace: "nowrap" }}>
                  En revision
                </div>
              )}
              {s.estado === "ACEPTADA" && (
                <div style={{ flexShrink: 0, fontSize: "11.5px", color: "#27500A", background: "#EAF3DE", padding: "5px 10px", borderRadius: "6px", whiteSpace: "nowrap" }}>
                  Agendada
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}