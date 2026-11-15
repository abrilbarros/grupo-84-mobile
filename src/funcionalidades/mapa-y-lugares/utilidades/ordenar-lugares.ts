import type { LugarConDistancia } from "../modelos/lugar-con-distancia";
import type { OrdenDeLugares } from "../modelos/orden-de-lugares";

function compararPorNombre(
  primero: LugarConDistancia,
  segundo: LugarConDistancia,
): number {
  return primero.lugar.nombre.localeCompare(segundo.lugar.nombre, "es");
}

function compararPorDistancia(
  primero: LugarConDistancia,
  segundo: LugarConDistancia,
): number {
  if (primero.distanciaEnMetros === null || segundo.distanciaEnMetros === null) {
    return compararPorNombre(primero, segundo);
  }
  return primero.distanciaEnMetros - segundo.distanciaEnMetros;
}

export function ordenarLugares(
  lugaresConDistancia: LugarConDistancia[],
  orden: OrdenDeLugares,
): LugarConDistancia[] {
  const criterio =
    orden === "distancia" ? compararPorDistancia : compararPorNombre;
  return [...lugaresConDistancia].sort(criterio);
}
