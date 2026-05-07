"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Extintor {
  id: string;
  codigo: string;
  tipo: string;
  capacidad: string;
  ubicacion: string;
  estado: string;
}

export default function SolicitarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [fecha, setFecha] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const clienteId = (session?.user as any)?.clienteId;
    if (!clienteId) return;
    fetch(`/api/extintores?clienteId=${clienteId}`)
      .then(r => r.json())
      .then(data => {
        setExtintores(data);
        const urgentes = data.filter((e: Extintor) => e.estado === "VENCIDO" || e.estado === "PROXIMO").map((e: Extintor) => e.id);
        setSeleccionados(urgentes);
        setLoading(false);
      });
  }, [session]);

  function toggleExt(id: string) {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSubmit() {
    if (seleccionados.length === 0) return;
    setEnviando(true);
    const clienteId = (session?.user as any)?.clienteId;
    await fetch("/api/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId, extintoresIds: seleccionados, fechaSolicitada: fecha || null, observaciones }),
    });
    setEnviando(false);
    setEnviado(true);
  }

  if (loading) return <div style={{ padding: "2rem", color: "#666", fontSize: "14px" }}>Cargando...</div>;

  if (enviado) return (
    <div style={{ padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "16px", padding: "2rem", maxWidth: "400px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
        <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "8px" }}>Solicitud enviada</div>
        <div style={{ fontSize: "13px", color: "#666", marginBottom: "1.5rem" }}>La empresa de extintores recibirá tu solicitud y te contactará para confirmar la fecha.</div>
        <button onClick={() => router.push("/cliente")} style={{ padding: "9px 18px", background: "#E24B4A", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "500", border: "none", cursor: "pointer" }}>
          Volver a mis extintores
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "18px", fontWeight: "500", marginBottom: "1.5rem" }}>Solicitar mantención</h1>
      <div style={{ maxWidth: "560px" }}>
        <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#666", marginBottom: "12px" }}>Selecciona los extintores</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {extintores.map(ext => {
              const sel = seleccionados.includes(ext.id);
              return (
                <div key={ext.id} onClick={() => toggleExt(ext.id)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: `0.5px solid ${sel ? "#E24B4A" : "#E5E4DC"}`, background: sel ? "#FCEBEB" : "#F5F4EF", cursor: "pointer" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: `1.5px solid ${sel ? "#E24B4A" : "#ccc"}`, background: sel ? "#E24B4A" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {sel && <span style={{ color: "#fff", fontSize: "10px", fontWeight: "700" }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>{ext.codigo}</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>{ext.tipo} · {ext.capacidad} · {ext.ubicacion}</div>
                  </div>
                  {ext.estado === "VENCIDO" && <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: "500" }}>Vencido</span>}
                  {ext.estado === "PROXIMO" && <span style={{ background: "#FAEEDA", color: "#633806", padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: "500" }}>Próximo</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: "#fff", border: "0.5px solid #E5E4DC", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: "13px", fontWeight: "500", color: "#666", marginBottom: "12px" }}>Detalles</div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "4px" }}>Fecha preferida (opcional)</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "0.5px solid #E5E4DC", fontSize: "13px" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "4px" }}>Observaciones (opcional)</label>
            <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Ej: disponibles solo en la mañana, acceso por portería..." style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "0.5px solid #E5E4DC", fontSize: "13px", height: "80px", resize: "none" }} />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={seleccionados.length === 0 || enviando} style={{ width: "100%", padding: "10px", background: seleccionados.length === 0 ? "#ccc" : "#E24B4A", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: seleccionados.length === 0 ? "not-allowed" : "pointer" }}>
          {enviando ? "Enviando..." : `Enviar solicitud (${seleccionados.length} extintor${seleccionados.length !== 1 ? "es" : ""})`}
        </button>
      </div>
    </div>
  );
}
