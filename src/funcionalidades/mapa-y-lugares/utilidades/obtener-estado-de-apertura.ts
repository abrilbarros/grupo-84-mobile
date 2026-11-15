import type { Horario } from "@/tipos/lugar";
import type { EstadoDeApertura } from "../modelos/estado-de-apertura";
import {
  convertirHoraAMinutos,
  MINUTOS_POR_HORA,
} from "./convertir-hora-a-minutos";

const DIAS_DE_LA_SEMANA = 7;

export function obtenerEstadoDeApertura(
  horarios: Horario[],
  ahora: Date,
): EstadoDeApertura | null {
  if (horarios.length === 0) return null;

  const diaActual = ahora.getDay();
  const diaAnterior = (diaActual + DIAS_DE_LA_SEMANA - 1) % DIAS_DE_LA_SEMANA;
  const minutosActuales = ahora.getHours() * MINUTOS_POR_HORA + ahora.getMinutes();

  for (const horario of horarios) {
    const minutosDeApertura = convertirHoraAMinutos(horario.abre);
    const minutosDeCierre = convertirHoraAMinutos(horario.cierra);
    const cruzaLaMedianoche = minutosDeCierre <= minutosDeApertura;
    const estadoAbierto: EstadoDeApertura = {
      estaAbierto: true,
      horaDeCierre: horario.cierra,
    };

    if (horario.dia === diaActual) {
      const estaDentroDelTramo = cruzaLaMedianoche
        ? minutosActuales >= minutosDeApertura
        : minutosActuales >= minutosDeApertura && minutosActuales < minutosDeCierre;
      if (estaDentroDelTramo) return estadoAbierto;
    }

    if (
      cruzaLaMedianoche &&
      horario.dia === diaAnterior &&
      minutosActuales < minutosDeCierre
    ) {
      return estadoAbierto;
    }
  }

  return { estaAbierto: false, horaDeCierre: null };
}
