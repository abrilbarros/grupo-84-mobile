import { eventosMock } from "@/mocks/eventos";
import type { Evento } from "@/tipos/evento";

// Las pantallas llaman a estas funciones, no al mock.
// Hoy buscan en el mock; cuando conectemos la API, solo cambia este archivo.

// Devuelve los eventos de un día. fecha = "AAAA-MM-DD", como pide la API (GET /eventos?fecha=).
// Es async desde ahora porque la API va a tardar en responder.
export async function listarEventos(fecha: string): Promise<Evento[]> {
  return eventosMock
    .filter((evento) => evento.inicio.startsWith(fecha))
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

// Devuelve un evento por su id, o null si no existe (para la pantalla de detalle).
export async function obtenerEvento(id: string): Promise<Evento | null> {
  return eventosMock.find((evento) => evento.id === id) ?? null;
}
