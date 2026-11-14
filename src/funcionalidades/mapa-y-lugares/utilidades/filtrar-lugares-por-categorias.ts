import type { Lugar } from "@/tipos/lugar";

export function filtrarLugaresPorCategorias(
  lugares: Lugar[],
  identificadoresDeCategorias: string[],
): Lugar[] {
  if (identificadoresDeCategorias.length === 0) return lugares;
  return lugares.filter((lugar) =>
    identificadoresDeCategorias.includes(lugar.categoriaId),
  );
}
