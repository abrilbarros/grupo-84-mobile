import type { Lugar } from "@/tipos/lugar";
import { normalizarTexto } from "./normalizar-texto";

export function filtrarLugaresPorNombre(
  lugares: Lugar[],
  textoDeBusqueda: string,
): Lugar[] {
  const textoNormalizado = normalizarTexto(textoDeBusqueda);
  if (textoNormalizado === "") return lugares;
  return lugares.filter((lugar) =>
    normalizarTexto(lugar.nombre).includes(textoNormalizado),
  );
}
