import type { RespuestaUno } from "@/tipos/api";
import type { ResumenLugar } from "@/tipos/lugar";
import { solicitar } from "./api";

// Lectura pública mínima; el módulo Lugares podrá ampliar este servicio.
export async function obtenerLugar(
  id: string,
  signal: AbortSignal,
): Promise<ResumenLugar> {
  const respuesta = await solicitar<RespuestaUno<ResumenLugar>>(
    `/lugares/${encodeURIComponent(id)}`,
    { signal },
  );
  const lugar = respuesta.datos;
  if (
    lugar?.id !== id ||
    !lugar.nombre ||
    !Array.isArray(lugar.imagenes) ||
    typeof lugar.descripcionCorta !== "string"
  ) {
    throw new Error("Respuesta de lugar inválida.");
  }
  return lugar;
}
