import { convertirRadianesAGrados } from "./convertir-radianes-a-grados";
import { normalizarGrados } from "./normalizar-grados";

export function calcularOrientacionDelMagnetometro(
  ejeHorizontal: number,
  ejeVertical: number,
): number {
  return normalizarGrados(
    convertirRadianesAGrados(Math.atan2(-ejeHorizontal, ejeVertical)),
  );
}
