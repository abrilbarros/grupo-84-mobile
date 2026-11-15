import type { Coordenadas } from "@/tipos/coordenadas";
import type { Lugar } from "@/tipos/lugar";
import type { LugarConDistancia } from "../modelos/lugar-con-distancia";
import { calcularDistanciaEnMetros } from "./calcular-distancia-en-metros";

export function agregarDistanciaALugares(
  lugares: Lugar[],
  ubicacionDelUsuario: Coordenadas | null,
): LugarConDistancia[] {
  return lugares.map((lugar) => ({
    lugar,
    distanciaEnMetros: ubicacionDelUsuario
      ? calcularDistanciaEnMetros(ubicacionDelUsuario, lugar.coordenadas)
      : null,
  }));
}
