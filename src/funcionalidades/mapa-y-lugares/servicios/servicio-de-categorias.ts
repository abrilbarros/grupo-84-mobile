import { solicitar } from "@/servicios/api";
import type { RespuestaLista } from "@/tipos/api";
import type { Categoria } from "@/tipos/categoria";

export async function descargarCategorias(): Promise<Categoria[]> {
  const respuesta = await solicitar<RespuestaLista<Categoria>>("/categorias");
  return respuesta.datos;
}
