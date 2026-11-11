import type { RespuestaLista, RespuestaUno } from "@/tipos/api";
import type { Evento } from "@/tipos/evento";
import { ErrorApi, solicitar } from "./api";

// Las pantallas llaman a estas funciones. Antes leían el mock; ahora piden los datos a la API.

// Devuelve los eventos de un día. fecha = "AAAA-MM-DD".
// porPagina=100 es el máximo de la API: así viene el día completo.
export async function listarEventos(fecha: string): Promise<Evento[]> {
  const respuesta = await solicitar<RespuestaLista<Evento>>(
    `/eventos?fecha=${fecha}&porPagina=100`,
  );
  return respuesta.datos;
}

// Devuelve un evento por su id, o null si la API responde 404 (no existe).
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
