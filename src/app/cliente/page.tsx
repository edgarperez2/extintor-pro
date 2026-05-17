"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MapPin, Clock, CalendarCheck, ChevronRight, Plus, X } from "lucide-react";

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

const TIPOS = ["PQS", "CO2", "AGUA", "ESPUMA", "HCFC"];

const tipoConfig: Record<string, { color: string; bg: string; gradiente: string; label: string }> = {
  CO2:    { color: "#2563EB", bg: "#EFF6FF", gradiente: "linear-gradient(135deg, #3B82F6, #1D4ED8)", label: "CO₂" },
  PQS:    { color: "#D97706", bg: "#FFFBEB", gradiente: "linear-gradient(135deg, #F59E0B, #B45309)", label: "PQS" },
  AGUA:   { color: "#0891B2", bg: "#ECFEFF", gradiente: "linear-gradient(135deg, #06B6D4, #0E7490)", label: "Agua" },
  ESPUMA: { color: "#059669", bg: "#ECFDF5", gradiente: "linear-gradient(135deg, #10B981, #047857)", label: "Espuma" },
  HCFC:   { color: "#7C3AED", bg: "#F5F3FF", gradiente: "linear-gradient(135deg, #8B5CF6, #6D28D9)", label: "HCFC" },
};

function ExtintorIcon({ color = "#fff", size = 36 }: { color?: string; size?: number }) {
  const h = Math.round(size * 1.6);
  return (
    <svg width={size} height={h} viewBox="0 0 60 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="38" width="32" height="54" rx="16" fill={color} />
      <rect x="21" y="22" width="18" height="20" rx="5" fill={color} />
      <rect x="16" y="16" width="28" height="9" rx="4.5" fill={color} />
      <rect x="7" y="17" width="13" height="4" rx="2" fill={color} />
      <rect x="7" y="17" width="4" height="13" rx="2" fill={color} />
      <path d="M46 56 C58 56 58 70 46 70" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="37" y="67" width="13" height="6" rx="3" fill={color} />
      <circle cx="30" cy="62" r="8" fill="white" fillOpacity="0.2" />
      <circle cx="30" cy="62" r="8" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <rect x="19" y="44" width="5" height="32" rx="2.5" fill="white" fillOpacity="0.12" />
    </svg>
  );
}

function BadgeEstado({ estado, dias }: { estado: string; dias: number | null }) {
  if (estado === "VENCIDO") return <span style={{ background: "#FCEBEB", color: "#791F1F", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "600" }}>Vencido</span>;
  if (estado === "PROXIMO") return <span style={{ background: "#FAEEDA", color: "#633806", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "600" }}>Vence en {dias}d</span>;
  if (estado === "AL_DIA") return <span style={{ background: "#EAF3DE", color: "#27500A", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "600" }}>Al día</span>;
  return <span style={{ background: "#F5F4EF", color: "#888", padding: "3px 9px", borderRadius: "5px", fontSize: "11.5px" }}>Sin mantención</span>;
}

function ProgressBar({ estado, dias }: { estado: string; dias: number | null }) {
  let pct = 50, color = "#639922";
  if (estado === "VENCIDO") { pct = 100; color = "#E24B4A"; }
  else if (estado === "PROXIMO") { pct = 82; color = "#BA7517"; }
  else if (estado === "AL_DIA" && dias !== null) pct = Math.max(8, Math.min(75, Math.round((365 - dias) / 365 * 100)));
  return (
    <div style={{ height: "4px", background: "rgba(0,0,0,0.08)", borderRadius: "2px", overflow: "hidden" }}>
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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

function AgregarExtintorModal({ clienteId, onClose, onSaved }: { clienteId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ tipo: "PQS", capacidad: "", ubicacion: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.capacidad || !form.ubicacion) { setError("Todos los campos son obligatorios"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/extintores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clienteId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error"); setSaving(false); return; }
      onSaved(); onClose();
    } catch {
      setError("Error de conexión"); setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #E24B4A, #B22020)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>Registrar extintor</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#791F1F" }}>{error}</div>}

          <div style={{ background: "#FEF3E2", border: "1px solid #F6C965", borderRadius: "8px", padding: "10px 12px", fontSize: "12.5px", color: "#633806" }}>
            El código del extintor será asignado automáticamente por el sistema.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Tipo *</label>
              <select style={{ ...inputStyle, background: "#fff" }} value={form.tipo} onChange={e => set("tipo", e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Capacidad *</label>
              <input style={inputStyle} value={form.capacidad} onChange={e => set("capacidad", e.target.value)} placeholder="6 kg" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "500", color: "#555", display: "block", marginBottom: "5px" }}>Ubicación *</label>
            <input style={inputStyle} value={form.ubicacion} onChange={e => set("ubicacion", e.target.value)} placeholder="Ej: Pasillo principal, Bodega, Oficina 2" />
          </div>

          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E4DC", background: "#fff", fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
              {saving ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div style={{ padding: "2rem" }}>
      <div className="skeleton" style={{ height: "22px", width: "160px", marginBottom: "1.75rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "16px", overflow: "hidden" }}>
            <div className="skeleton" style={{ height: "90px", borderRadius: 0 }} />
            <div style={{ padding: "1rem" }}>
              <div className="skeleton" style={{ height: "12px", width: "130px", marginBottom: "6px" }} />
              <div className="skeleton" style={{ height: "12px", width: "110px", marginBottom: "6px" }} />
              <div className="skeleton" style={{ height: "4px", width: "100%", marginTop: "12px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClienteDashboard() {
  const { data: session } = useSession();
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const clienteId = (session?.user as any)?.clienteId;

  function cargar() {
    if (!clienteId) return;
    fetch(`/api/extintores?clienteId=${clienteId}`)
      .then(r => r.json())
      .then(data => { setExtintores(data); setLoading(false); });
  }

  useEffect(() => {
    if (clienteId) cargar();
  }, [session]);

  if (loading) return <SkeletonCards />;

  const borderColor = (estado: string) =>
    estado === "VENCIDO" ? "#F7C1C1" : estado === "PROXIMO" ? "#F6D894" : "#EBEBEB";

  return (
    <>
      {modalOpen && clienteId && (
        <AgregarExtintorModal
          clienteId={clienteId}
          onClose={() => setModalOpen(false)}
          onSaved={cargar}
        />
      )}

      <div style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", letterSpacing: "-0.01em" }}>Mis extintores</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setModalOpen(true)}
              style={{ padding: "8px 14px", background: "#fff", color: "#555", border: "1px solid #E5E4DC", borderRadius: "8px", fontSize: "13px", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontFamily: "inherit" }}
            >
              <Plus size={14} /> Registrar extintor
            </button>
            {extintores.length > 0 && (
              <Link href="/cliente/solicitar" style={{ padding: "8px 16px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 3px 10px rgba(226,75,74,0.35)" }}>
                Solicitar mantención <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>

        <EstadoBanner extintores={extintores} />

        {extintores.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "16px", padding: "3rem 2rem", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", background: "#FEF2F2", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <svg width="28" height="45" viewBox="0 0 60 96" fill="none">
                <rect x="14" y="38" width="32" height="54" rx="16" fill="#E24B4A" fillOpacity="0.3" />
                <rect x="21" y="22" width="18" height="20" rx="5" fill="#E24B4A" fillOpacity="0.3" />
                <rect x="16" y="16" width="28" height="9" rx="4.5" fill="#E24B4A" fillOpacity="0.3" />
              </svg>
            </div>
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>No tienes extintores registrados</p>
            <p style={{ fontSize: "13.5px", color: "#888", marginBottom: "1.5rem", lineHeight: 1.6, maxWidth: "320px", margin: "0 auto 1.5rem" }}>
              Registra tus extintores para hacer seguimiento de sus mantenciones y vencimientos.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              style={{ padding: "10px 24px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "9px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(226,75,74,0.35)" }}
            >
              + Registrar primer extintor
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {extintores.map(ext => {
              const cfg = tipoConfig[ext.tipo] ?? { color: "#E24B4A", bg: "#FEF2F2", gradiente: "linear-gradient(135deg, #E24B4A, #C0392B)", label: ext.tipo };
              return (
                <div key={ext.id} className="card-hover" style={{ background: "#fff", border: `1px solid ${borderColor(ext.estado)}`, borderRadius: "16px", overflow: "hidden" }}>
                  <div style={{ background: cfg.gradiente, padding: "1.1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", letterSpacing: "-0.01em" }}>{ext.codigo}</div>
                      <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>{cfg.label} · {ext.capacidad}</div>
                    </div>
                    <div style={{ opacity: 0.9 }}>
                      <ExtintorIcon color="#fff" size={32} />
                    </div>
                  </div>

                  <div style={{ padding: "10px 1.25rem 0", display: "flex", justifyContent: "flex-end" }}>
                    <BadgeEstado estado={ext.estado} dias={ext.diasRestantes} />
                  </div>

                  <div style={{ padding: "10px 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "#777" }}>
                      <MapPin size={12} color="#bbb" strokeWidth={2} />
                      {ext.ubicacion}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "#777" }}>
                      <Clock size={12} color="#bbb" strokeWidth={2} />
                      Última: {ext.ultimaMantencion ? new Date(ext.ultimaMantencion).toLocaleDateString("es-CL") : "—"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "500", color: ext.estado === "VENCIDO" ? "#791F1F" : ext.estado === "PROXIMO" ? "#633806" : "#27500A", marginBottom: "10px" }}>
                      <CalendarCheck size={12} strokeWidth={2} color={ext.estado === "VENCIDO" ? "#E24B4A" : ext.estado === "PROXIMO" ? "#BA7517" : "#639922"} />
                      {ext.estado === "VENCIDO" ? "Venció: " : "Vence: "}
                      {ext.proximaMantencion ? new Date(ext.proximaMantencion).toLocaleDateString("es-CL") : "—"}
                    </div>
                    <ProgressBar estado={ext.estado} dias={ext.diasRestantes} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
