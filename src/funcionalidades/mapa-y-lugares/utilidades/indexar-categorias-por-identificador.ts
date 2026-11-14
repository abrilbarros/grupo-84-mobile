import type { Categoria } from "@/tipos/categoria";

export function indexarCategoriasPorIdentificador(
  categorias: Categoria[],
): Record<string, Categoria> {
  return Object.fromEntries(
    categorias.map((categoria) => [categoria.id, categoria]),
  );
}
