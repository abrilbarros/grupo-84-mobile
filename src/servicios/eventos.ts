import Storage from "expo-sqlite/kv-store";

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

export function guardarAgenda(fecha: string, eventos: Evento[]) {
  Storage.setItemSync(`agenda-${fecha}`, JSON.stringify(eventos));
  eventos.forEach((evento) =>
    Storage.setItemSync(`evento-${evento.id}`, JSON.stringify(evento)),
  );
}

export function leerAgenda(fecha: string): Evento[] | null {
  const texto = Storage.getItemSync(`agenda-${fecha}`);
  return texto === null ? null : JSON.parse(texto);
}

export function leerEventoGuardado(id: string): Evento | null {
  const texto = Storage.getItemSync(`evento-${id}`);
  return texto === null ? null : JSON.parse(texto);
}
