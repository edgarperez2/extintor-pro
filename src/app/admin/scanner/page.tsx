"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, X, CheckCircle, AlertCircle } from "lucide-react";
import jsQR from "jsqr";

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [estado, setEstado] = useState<"idle" | "scanning" | "detectado">("idle");
  const [error, setError] = useState("");
  const [codigoDetectado, setCodigoDetectado] = useState("");
  const [codigoManual, setCodigoManual] = useState("");

  // Limpieza garantizada al salir de la página
  useEffect(() => {
    return () => { pararCamara(); };
  }, []);

  function pararCamara() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) { videoRef.current.srcObject = null; }
  }

  async function iniciarEscaner() {
    setError(""); setCodigoDetectado("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      const video = videoRef.current!;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      setEstado("scanning");

      // Escanear frames con jsQR (funciona en todos los navegadores)
      intervalRef.current = setInterval(() => {
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c || v.readyState < 2 || v.videoWidth === 0) return;

        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(v, 0, 0);

        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          onDetectado(code.data);
        }
      }, 250);

    } catch (err: any) {
      const msg = (err?.message ?? err?.name ?? "").toLowerCase();
      if (msg.includes("notallowed") || msg.includes("denied") || msg.includes("permission")) {
        setError("Permiso denegado. Ve a la configuración del navegador y permite el acceso a la cámara.");
      } else if (msg.includes("notfound") || msg.includes("devicenotfound")) {
        setError("No se encontró ninguna cámara en este dispositivo.");
      } else if (msg.includes("notreadable") || msg.includes("trackstart")) {
        setError("La cámara está siendo usada por otra aplicación. Ciérrala e intenta de nuevo.");
      } else {
        setError("No se pudo activar la cámara. Verifica los permisos del navegador.");
      }
    }
  }

  function onDetectado(valor: string) {
    const partes = valor.split("/ext/");
    const codigo = partes.length > 1
      ? partes.pop()!.split("/")[0].toUpperCase()
      : valor.trim().toUpperCase();

    setCodigoDetectado(codigo);
    setEstado("detectado");
    pararCamara();
    setTimeout(() => router.push(`/ext/${codigo}`), 1100);
  }

  function detenerEscaner() {
    pararCamara();
    setEstado("idle");
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "540px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "6px" }}>Escanear QR</h1>
      <p style={{ fontSize: "13.5px", color: "#888", marginBottom: "1.75rem" }}>
        Escanea el código QR de un extintor para ver su información.
      </p>

      {/* Visor de cámara */}
      <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: "14px", overflow: "hidden", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", background: "#111", aspectRatio: "4/3", minHeight: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>

          {/* Video — siempre en el DOM */}
          <video
            ref={videoRef}
            muted
            playsInline
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              display: estado === "scanning" ? "block" : "none",
            }}
          />
          {/* Canvas oculto para jsQR */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Marco visual de escaneo */}
          {estado === "scanning" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ width: "210px", height: "210px", position: "relative" }}>
                {[
                  { top: 0, left: 0, borderWidth: "3px 0 0 3px" },
                  { top: 0, right: 0, borderWidth: "3px 3px 0 0" },
                  { bottom: 0, left: 0, borderWidth: "0 0 3px 3px" },
                  { bottom: 0, right: 0, borderWidth: "0 3px 3px 0" },
                ].map((s, i) => (
                  <div key={i} style={{ position: "absolute", width: "28px", height: "28px", borderStyle: "solid", borderColor: "#E24B4A", borderRadius: "2px", ...s }} />
                ))}
              </div>
            </div>
          )}

          {/* Estado: idle */}
          {estado === "idle" && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ width: "72px", height: "72px", background: "rgba(226,75,74,0.15)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <ScanLine size={34} color="#E24B4A" />
              </div>
              <p style={{ color: "#aaa", fontSize: "13.5px" }}>Cámara apagada</p>
            </div>
          )}

          {/* Estado: detectado */}
          {estado === "detectado" && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <CheckCircle size={52} color="#27AE60" style={{ marginBottom: "12px" }} />
              <p style={{ color: "#fff", fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>{codigoDetectado}</p>
              <p style={{ color: "#aaa", fontSize: "13px" }}>Redirigiendo...</p>
            </div>
          )}
        </div>

        {/* Botón control */}
        <div style={{ padding: "1rem" }}>
          {estado !== "scanning" ? (
            <button
              onClick={iniciarEscaner}
              style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "9px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <ScanLine size={16} /> Activar cámara
            </button>
          ) : (
            <button
              onClick={detenerEscaner}
              style={{ width: "100%", padding: "11px", background: "#fff", color: "#444", border: "1px solid #E5E4DC", borderRadius: "9px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <X size={16} /> Apagar cámara
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#FCEBEB", border: "1px solid #F7C1C1", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#791F1F", marginBottom: "1.25rem", display: "flex", gap: "8px", alignItems: "flex-start" }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
          {error}
        </div>
      )}

      {/* Código manual */}
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
            style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "1px solid #E5E4DC", fontSize: "13.5px", outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={() => codigoManual.trim() && router.push(`/ext/${codigoManual.trim()}`)}
            disabled={!codigoManual.trim()}
            style={{ padding: "9px 18px", background: "linear-gradient(135deg, #E24B4A, #C0392B)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13.5px", fontWeight: "600", cursor: codigoManual.trim() ? "pointer" : "not-allowed", opacity: codigoManual.trim() ? 1 : 0.5, fontFamily: "inherit" }}
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
