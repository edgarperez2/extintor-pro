// Ficha pública del extintor — se accede escaneando el QR
// No requiere autenticación
import { notFound } from "next/navigation";

async function getExtintor(codigo: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/extintores/codigo/${codigo}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function BadgeEstado({ estado, dias }: { estado: string; dias: number | null }) {
  if (estado === "VENCIDO") return <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "5px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "500" }}>⚠ Vencido</span>;
  if (estado === "PROXIMO") return <span style={{ background: "#FAEEDA", color: "#633806", padding: "5px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "500" }}>⏰ Vence en {dias} días</span>;
  if (estado === "AL_DIA") return <span style={{ background: "#EAF3DE", color: "#27500A", padding: "5px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "500" }}>✓ Al día</span>;
  return <span style={{ background: "#F5F4EF", color: "#666", padding: "5px 12px", borderRadius: "6px", fontSize: "13px" }}>Sin mantención registrada</span>;
}

export default async function ExtintorPublicoPage({ params }: { params: { codigo: string } }) {
  const ext = await getExtintor(params.codigo.toUpperCase());
  if (!ext) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "#F5F4EF", fontFamily: "sans-serif", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
          <div style={{ width: "32px", height: "32px", background: "#E24B4A", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: "600" }}>EX</div>
          <span style={{ fontSize: "15px", fontWeight: "500" }}>ExtintorPro</span>
        </div>

        {/* Card principal */}
        <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "500" }}>{ext.codigo}</div>
              <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>{ext.tipo} · {ext.capacidad}</div>
            </div>
            <BadgeEstado estado={ext.estado} dias={ext.diasRestantes} />
          </div>

          {ext.estado === "VENCIDO" && (
            <div style={{ background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", marginBottom: "1rem", fontSize: "13px", color: "#791F1F" }}>
              Este extintor requiere mantención urgente. Contacta a la empresa para regularizarlo.
            </div>
          )}

          {[
            ["Cliente", ext.cliente],
            ["Ubicación", ext.ubicacion],
            ["Última mantención", ext.ultimaMantencion ? new Date(ext.ultimaMantencion).toLocaleDateString("es-CL") : "—"],
            ["Próxima mantención", ext.proximaMantencion ? new Date(ext.proximaMantencion).toLocaleDateString("es-CL") : "—"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #F5F4EF", fontSize: "13px" }}>
              <span style={{ color: "#666" }}>{k}</span>
              <span style={{ fontWeight: "500" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Historial */}
        {ext.historial?.length > 0 && (
          <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "16px", padding: "1.25rem" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "#666", marginBottom: "12px" }}>Historial de mantenciones</div>
            {ext.historial.map((h: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < ext.historial.length - 1 ? "0.5px solid #F5F4EF" : "none" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#639922", flexShrink: 0, marginTop: "4px" }} />
                <div>
                  <div style={{ fontSize: "13px" }}>Mantención realizada</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{new Date(h.fecha).toLocaleDateString("es-CL")}{h.tecnico ? ` · ${h.tecnico}` : ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "12px", color: "#999" }}>
          ExtintorPro · Sistema de gestión de extintores
        </div>
      </div>
    </div>
  );
}
