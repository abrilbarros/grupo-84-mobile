import type { Coordenadas } from "@/tipos/coordenadas";
import { convertirGradosARadianes } from "./convertir-grados-a-radianes";
import { convertirRadianesAGrados } from "./convertir-radianes-a-grados";
import { normalizarGrados } from "./normalizar-grados";

export function calcularRumboEnGrados(
  origen: Coordenadas,
  destino: Coordenadas,
): number {
  const latitudDeOrigen = convertirGradosARadianes(origen.latitud);
  const latitudDeDestino = convertirGradosARadianes(destino.latitud);
  const diferenciaDeLongitud = convertirGradosARadianes(
    destino.longitud - origen.longitud,
  );

  const componenteEsteOeste =
    Math.sin(diferenciaDeLongitud) * Math.cos(latitudDeDestino);
  const componenteNorteSur =
    Math.cos(latitudDeOrigen) * Math.sin(latitudDeDestino) -
    Math.sin(latitudDeOrigen) *
      Math.cos(latitudDeDestino) *
      Math.cos(diferenciaDeLongitud);

  return normalizarGrados(
    convertirRadianesAGrados(
      Math.atan2(componenteEsteOeste, componenteNorteSur),
    ),
  );
}
