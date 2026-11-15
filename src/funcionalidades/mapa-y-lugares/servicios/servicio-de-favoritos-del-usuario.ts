import { listarFavoritos } from "@/servicios/favoritos";

export async function descargarIdentificadoresDeLugaresFavoritos(
  token: string,
  senalDeCancelacion: AbortSignal,
): Promise<string[]> {
  const identificadoresDeLugares: string[] = [];
  let paginaActual = 1;
  let hayMasPaginas = true;

  while (hayMasPaginas) {
    const respuesta = await listarFavoritos(
      token,
      paginaActual,
      senalDeCancelacion,
    );
    identificadoresDeLugares.push(
      ...respuesta.datos.map((favorito) => favorito.lugarId),
    );
    hayMasPaginas =
      respuesta.datos.length > 0 &&
      identificadoresDeLugares.length < respuesta.meta.total;
    paginaActual += 1;
  }

  return identificadoresDeLugares;
}
