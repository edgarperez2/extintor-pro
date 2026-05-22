"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, X, CheckCircle, AlertCircle } from "lucide-react";

export default function ScannerPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<"idle" | "scanning" | "detectado">("idle");
  const [error, setError] = useState("");
  const [codigoManual, setCodigoManual] = useState("");
  const [codigoDetectado, setCodigoDetectado] = useState("");
  const scannerRef = useRef<any>(null);

  async function iniciarEscaner() {
    setError("");
    setCodigoDetectado("");
    setEstado("scanning");

    // Pequeño delay para que React renderice el div antes de que html5-qrcode lo use
    await new Promise(r => setTimeout(r, 80));

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Limpiar instancia anterior
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); scannerRef.current.clear(); } catch {}
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText: string) => {
          // QR detectado
          const partes = decodedText.split("/ext/");
          const codigo = partes.length > 1
            ? partes.pop()!.split("/")[0].toUpperCase()
            : decodedText.trim().toUpperCase();

          setCodigoDetectado(codigo);
          setEstado("detectado");

          detenerEscaner().then(() => {
            setTimeout(() => router.push(`/ext/${codigo}`), 1000);
          });
        },
        () => { /* frame sin QR — ignorar */ }
      );
    } catch (err: any) {
      setEstado("idle");
      const msg = (typeof err === "string" ? err : err?.message ?? "").toLowerCase();
      if (msg.includes("permission") || msg.includes("denied") || msg.includes("notallowed")) {
        setError("Permiso denegado. Habilita el acceso a la cámara en tu navegador y vuelve a intentarlo.");
      } else if (msg.includes("notfound") || msg.includes("no camera") || msg.includes("overconstrained")) {
        setError("No se encontró cámara en este dispositivo.");
      } else {
        setError("No se pudo activar la cámara. Verifica los permisos del navegador.");
      }
    }
  }

  async function detenerEscaner() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setEstado("idle");
  }

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
      }
    };
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "540px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "6px" }}>
        Escanear QR
      </h1>
      <p style={{ fontSize: "13.5px", color: "#888", marginBottom: "1.75rem" }}>
        Escanea el código QR de un extintor para ver su información.
      </p>

      {/* Visor de cámara */}
      <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", background: "#111", minHeight: "280px" }}>

          {/* El div que usa html5-qrcode — siempre en el DOM cuando scanning */}
          {estado === "scanning" && (
            <div id="qr-reader" style={{ width: "100%" }} />
          )}

          {/* Estado: idle */}
          {estado === "idle" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "280px", padding: "2rem", textAlign: "center" }}>
              <div style={{
                width: "72px", height: "72px",
                background: "rgba(226,75,74,0.18)",
                borderRadius: "18px",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem",
              }}>
                <ScanLine size={34} color="#E24B4A" />
              </div>
              <p style={{ color: "#aaa", fontSize: "13.5px" }}>Cámara apagada</p>
              <p style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
                Presiona "Activar cámara" para iniciar
              </p>
            </div>
          )}

          {/* Estado: detectado */}
          {estado === "detectado" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "280px", padding: "2rem", textAlign: "center" }}>
              <CheckCircle size={56} color="#27AE60" style={{ marginBottom: "14px" }} />
              <p style={{ color: "#fff", fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>
                QR detectado: {codigoDetectado}
              </p>
              <p style={{ color: "#aaa", fontSize: "13px" }}>Redirigiendo...</p>
            </div>
          )}
        </div>

        {/* Botones de control */}
        <div style={{ padding: "1rem" }}>
          {estado !== "scanning" ? (
            <button
              onClick={iniciarEscaner}
              style={{
                width: "100%", padding: "11px",
                background: "linear-gradient(135deg, #E24B4A, #C0392B)",
                color: "#fff", border: "none", borderRadius: "9px",
                fontSize: "14px", fontWeight: "600", cursor: "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px",
              }}
            >
              <ScanLine size={16} /> Activar cámara
            </button>
          ) : (
            <button
              onClick={detenerEscaner}
              style={{
                width: "100%", padding: "11px",
                background: "#fff", color: "#666",
                border: "1px solid #E5E4DC", borderRadius: "9px",
                fontSize: "14px", cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              <X size={16} /> Detener cámara
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#FCEBEB", border: "1px solid #F7C1C1",
          borderRadius: "10px", padding: "12px 14px",
          fontSize: "13px", color: "#791F1F",
          marginBottom: "1.25rem",
          display: "flex", gap: "8px", alignItems: "flex-start",
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
          {error}
        </div>
      )}

      {/* Entrada manual */}
      <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", padding: "1.25rem" }}>
        <p style={{ fontSize: "13px", fontWeight: "500", color: "#555", marginBottom: "10px" }}>
          O ingresa el código manualmente
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={codigoManual}
            onChange={e => setCodigoManual(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && codigoManual.trim() && router.push(`/ext/${codigoManual.trim()}`)}
            placeholder="EXT-0001"
            style={{
              flex: 1, padding: "9px 12px", borderRadius: "8px",
              border: "1px solid #E5E4DC", fontSize: "13.5px",
              outline: "none", fontFamily: "inherit",
            }}
          />
          <button
            onClick={() => codigoManual.trim() && router.push(`/ext/${codigoManual.trim()}`)}
            disabled={!codigoManual.trim()}
            style={{
              padding: "9px 18px",
              background: "linear-gradient(135deg, #E24B4A, #C0392B)",
              color: "#fff", border: "none", borderRadius: "8px",
              fontSize: "13.5px", fontWeight: "600",
              cursor: codigoManual.trim() ? "pointer" : "not-allowed",
              opacity: codigoManual.trim() ? 1 : 0.5,
              fontFamily: "inherit",
            }}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Ocultar la UI nativa de html5-qrcode, solo mostramos el video */}
      <style>{`
        #qr-reader { border: none !important; padding: 0 !important; }
        #qr-reader video { width: 100% !important; max-width: 100% !important; }
        #qr-reader__scan_region { background: transparent !important; }
        #qr-reader__dashboard { display: none !important; }
        #qr-reader__header_message { display: none !important; }
        #qr-reader__status_span { display: none !important; }
      `}</style>
    </div>
  );
}
