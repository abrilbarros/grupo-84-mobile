import type { Coordenadas } from "@/tipos/coordenadas";

export function convertirCoordenadasParaElMapa(coordenadas: Coordenadas) {
  return { latitude: coordenadas.latitud, longitude: coordenadas.longitud };
}
