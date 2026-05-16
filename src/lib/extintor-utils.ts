// src/lib/extintor-utils.ts
// Lógica de negocio compartida para el estado de extintores

export type EstadoExtintor = "VENCIDO" | "PROXIMO" | "AL_DIA" | "SIN_MANTENCION";

export interface ExtintorEstado {
  estado: EstadoExtintor;
  diasRestantes: number | null;   // negativo = días vencido
  ultimaMantencion: Date | null;
  proximaMantencion: Date | null;
}

/**
 * Calcula el estado de un extintor dado su historial de mantenciones.
 * Toma la mantención más reciente (mayor fecha) como referencia.
 */
export function calcularEstado(mantenciones: { fecha: Date; proximaFecha: Date }[]): ExtintorEstado {
  if (!mantenciones.length) {
    return {
      estado: "SIN_MANTENCION",
      diasRestantes: null,
      ultimaMantencion: null,
      proximaMantencion: null,
    };
  }

  // Ordenar por fecha descendente y tomar la más reciente
  const sorted = [...mantenciones].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  const ultima = sorted[0];

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proxima = new Date(ultima.proximaFecha);
  proxima.setHours(0, 0, 0, 0);

  const diffMs = proxima.getTime() - hoy.getTime();
  const diasRestantes = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let estado: EstadoExtintor;
  if (diasRestantes < 0) {
    estado = "VENCIDO";
  } else if (diasRestantes <= 30) {
    estado = "PROXIMO";
  } else {
    estado = "AL_DIA";
  }

  return {
    estado,
    diasRestantes,
    ultimaMantencion: ultima.fecha,
    proximaMantencion: ultima.proximaFecha,
  };
}

/**
 * Etiqueta legible para el estado
 */
export function etiquetaEstado(estado: EstadoExtintor, dias: number | null): string {
  switch (estado) {
    case "VENCIDO":
      return `Vencido hace ${Math.abs(dias ?? 0)} días`;
    case "PROXIMO":
      return dias === 0 ? "Vence hoy" : `Vence en ${dias} días`;
    case "AL_DIA":
      return `Al día · ${dias} días`;
    case "SIN_MANTENCION":
      return "Sin mantención registrada";
  }
}

/**
 * Genera el código siguiente para un extintor (EXT-XXXX)
 */
export function generarCodigo(ultimoCodigo: string | null): string {
  if (!ultimoCodigo) return "EXT-0001";
  const num = parseInt(ultimoCodigo.replace("EXT-", ""), 10);
  return `EXT-${String(num + 1).padStart(4, "0")}`;
}
