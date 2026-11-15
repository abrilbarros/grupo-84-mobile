import type { Coordenadas } from "@/tipos/coordenadas";
import { convertirGradosARadianes } from "./convertir-grados-a-radianes";

const RADIO_DE_LA_TIERRA_EN_METROS = 6371000;

export function calcularDistanciaEnMetros(
  origen: Coordenadas,
  destino: Coordenadas,
): number {
  const diferenciaDeLatitud = convertirGradosARadianes(
    destino.latitud - origen.latitud,
  );
  const diferenciaDeLongitud = convertirGradosARadianes(
    destino.longitud - origen.longitud,
  );
  const latitudDeOrigen = convertirGradosARadianes(origen.latitud);
  const latitudDeDestino = convertirGradosARadianes(destino.latitud);

  const componenteHaversine =
    Math.sin(diferenciaDeLatitud / 2) ** 2 +
    Math.cos(latitudDeOrigen) *
      Math.cos(latitudDeDestino) *
      Math.sin(diferenciaDeLongitud / 2) ** 2;

  const distanciaAngular =
    2 *
    Math.atan2(
      Math.sqrt(componenteHaversine),
      Math.sqrt(1 - componenteHaversine),
    );

  return RADIO_DE_LA_TIERRA_EN_METROS * distanciaAngular;
}
