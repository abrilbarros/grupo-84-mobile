import type { Visita, OrigenVisita } from "@/tipos/visita";
import { solicitar } from "./api";

export async function registrarVisita(lugarId: string, origen: OrigenVisita): Promise<Visita> {
  const respuesta = await solicitar<Visita>("/visitas", {
    method: "POST",
    body: JSON.stringify({
      lugarId,
      origen,
      fechaHora: new Date().toISOString(),
    }),
  });
  return respuesta;
}

export async function obtenerCategorias() {
  const respuesta = await solicitar<any>("/categorias");
  return respuesta.datos || respuesta;
}

export async function obtenerLugares(categoriaId?: string) {
  const ruta = categoriaId ? `/lugares?categoriaId=${categoriaId}` : "/lugares";
  const respuesta = await solicitar<any>(ruta);
  return respuesta.datos || respuesta;
}

// Traer un lugar específico por su ID (vital para cuando escaneamos el QR)
export async function obtenerLugarPorId(id: string) {
  const respuesta = await solicitar<any>(`/lugares/${id}`);
  return respuesta.datos || respuesta;
}