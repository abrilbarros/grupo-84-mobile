import type { Categoria } from "@/tipos/categoria";
import type { Lugar } from "@/tipos/lugar";

export interface Catalogo {
  lugares: Lugar[];
  categorias: Categoria[];
}
