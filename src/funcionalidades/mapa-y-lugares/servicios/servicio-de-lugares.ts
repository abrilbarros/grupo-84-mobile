import { solicitar } from "@/servicios/api";
import type { RespuestaLista } from "@/tipos/api";
import type { Lugar } from "@/tipos/lugar";
import { LUGARES_POR_PAGINA_AL_DESCARGAR_EL_CATALOGO } from "../constantes/cantidades";

export async function descargarLugares(): Promise<Lugar[]> {
  const respuesta = await solicitar<RespuestaLista<Lugar>>(
    `/lugares?porPagina=${LUGARES_POR_PAGINA_AL_DESCARGAR_EL_CATALOGO}`,
  );
  return respuesta.datos;
}
