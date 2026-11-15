import type { Coordenadas } from "@/tipos/coordenadas";
import type { Lugar } from "@/tipos/lugar";
import type { LugarConDistancia } from "../modelos/lugar-con-distancia";
import type { OrdenDeLugares } from "../modelos/orden-de-lugares";
import { agregarDistanciaALugares } from "./agregar-distancia-a-lugares";
import { filtrarLugaresPorCategorias } from "./filtrar-lugares-por-categorias";
import { filtrarLugaresPorNombre } from "./filtrar-lugares-por-nombre";
import { ordenarLugares } from "./ordenar-lugares";

interface ParametrosParaObtenerLugaresVisibles {
  lugares: Lugar[];
  identificadoresDeCategoriasSeleccionadas: string[];
  textoDeBusqueda: string;
  ubicacionDelUsuario: Coordenadas | null;
  orden: OrdenDeLugares;
}

export function obtenerLugaresVisibles({
  lugares,
  identificadoresDeCategoriasSeleccionadas,
  textoDeBusqueda,
  ubicacionDelUsuario,
  orden,
}: ParametrosParaObtenerLugaresVisibles): LugarConDistancia[] {
  const lugaresDeLasCategorias = filtrarLugaresPorCategorias(
    lugares,
    identificadoresDeCategoriasSeleccionadas,
  );
  const lugaresConElNombreBuscado = filtrarLugaresPorNombre(
    lugaresDeLasCategorias,
    textoDeBusqueda,
  );
  const lugaresConDistancia = agregarDistanciaALugares(
    lugaresConElNombreBuscado,
    ubicacionDelUsuario,
  );
  return ordenarLugares(lugaresConDistancia, orden);
}
