import type { RespuestaLista, RespuestaUno } from "@/tipos/api";
import type { Favorito } from "@/tipos/favorito";
import { solicitar } from "./api";

export function listarFavoritos(
  token: string,
  pagina: number,
  signal: AbortSignal,
) {
  return solicitar<RespuestaLista<Favorito>>(
    `/yo/favoritos?pagina=${pagina}&porPagina=20`,
    { headers: { Authorization: `Bearer ${token}` }, signal },
  );
}

export async function agregarFavorito(
  token: string,
  lugarId: string,
  signal: AbortSignal,
): Promise<Favorito> {
  const respuesta = await solicitar<RespuestaUno<Favorito>>(
    `/yo/favoritos/${encodeURIComponent(lugarId)}`,
    { method: "PUT", headers: { Authorization: `Bearer ${token}` }, signal },
  );
  return respuesta.datos;
}

export function quitarFavorito(
  token: string,
  lugarId: string,
  signal: AbortSignal,
): Promise<void> {
  return solicitar<void>(`/yo/favoritos/${encodeURIComponent(lugarId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
}
