import type { Lugar } from "@/tipos/lugar";

export interface LugarConDistancia {
  lugar: Lugar;
  distanciaEnMetros: number | null;
}
