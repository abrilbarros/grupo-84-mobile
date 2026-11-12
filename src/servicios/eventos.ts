import type { RespuestaLista, RespuestaUno } from "@/tipos/api";
import type { Evento } from "@/tipos/evento";
import { ErrorApi, solicitar } from "./api";


export async function listarEventos(fecha: string): Promise<Evento[]> {
  const respuesta = await solicitar<RespuestaLista<Evento>>(
    `/eventos?fecha=${fecha}&porPagina=100`,
  );
  return respuesta.datos;
}

export async function obtenerEvento(id: string): Promise<Evento | null> {
  try {
    const respuesta = await solicitar<RespuestaUno<Evento>>(
      `/eventos/${encodeURIComponent(id)}`,
    );
    return respuesta.datos;
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 404) return null;
    throw error;
  }
}

export async function cambiarEstadoEvento(
  id: string,
  estado: "programado" | "suspendido" | "cancelado",
  token: string,
): Promise<Evento> {
  const respuesta = await solicitar<RespuestaUno<Evento>>(
    `/eventos/${encodeURIComponent(id)}/estado`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    },
  );
  return respuesta.datos;
}
