import { ErrorApi, solicitar } from "@/servicios/api";
import type { RespuestaLista, RespuestaUno } from "@/tipos/api";
import type { Lugar } from "@/tipos/lugar";
import { LUGARES_POR_PAGINA_AL_DESCARGAR_EL_CATALOGO } from "../constantes/cantidades";

export async function descargarLugares(): Promise<Lugar[]> {
  const respuesta = await solicitar<RespuestaLista<Lugar>>(
    `/lugares?porPagina=${LUGARES_POR_PAGINA_AL_DESCARGAR_EL_CATALOGO}`,
  );
  return respuesta.datos;
}

export async function descargarLugarPorIdentificador(
  identificadorDelLugar: string,
  senalDeCancelacion: AbortSignal,
): Promise<Lugar | null> {
  try {
    const respuesta = await solicitar<RespuestaUno<Lugar>>(
      `/lugares/${encodeURIComponent(identificadorDelLugar)}`,
      { signal: senalDeCancelacion },
    );
    return respuesta.datos;
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 404) return null;
    throw error;
  }
}
