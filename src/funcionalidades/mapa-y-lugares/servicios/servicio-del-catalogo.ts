import type { Catalogo } from "../modelos/catalogo";
import { guardarCatalogo } from "./almacenamiento-del-catalogo";
import { descargarCategorias } from "./servicio-de-categorias";
import { descargarLugares } from "./servicio-de-lugares";

export async function descargarCatalogo(): Promise<Catalogo> {
  const [lugares, categorias] = await Promise.all([
    descargarLugares(),
    descargarCategorias(),
  ]);
  const catalogo: Catalogo = { lugares, categorias };
  guardarCatalogo(catalogo);
  return catalogo;
}
