import type { Categoria } from "@/tipos/categoria";
import type { NombreDeIcono } from "../modelos/nombre-de-icono";

const ICONO_POR_DEFECTO: NombreDeIcono = "location-outline";

export function obtenerNombreDeIconoDeCategoria(
  categoria: Categoria | undefined,
): NombreDeIcono {
  return categoria ? (categoria.icono as NombreDeIcono) : ICONO_POR_DEFECTO;
}
