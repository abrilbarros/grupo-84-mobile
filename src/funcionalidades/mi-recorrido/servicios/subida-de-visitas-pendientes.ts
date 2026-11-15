import { ErrorConexion } from "@/servicios/api";
import {
  actualizarFotoVisita,
  registrarVisita,
  subirFotografia,
} from "@/servicios/recorrido";
import type { Visita } from "@/tipos/visita";
import { esFotografiaGuardadaEnElTelefono } from "../utilidades/es-fotografia-guardada-en-el-telefono";
import { existeLaFotografiaEnElTelefono } from "./almacenamiento-de-fotografias";
import {
  listarVisitasPendientes,
  marcarVisitaComoSincronizada,
} from "./repositorio-de-visitas";

async function subirVisita(token: string, visita: Visita): Promise<void> {
  await registrarVisita(token, {
    id: visita.id,
    lugarId: visita.lugarId,
    origen: visita.origen,
    fechaHora: visita.fechaHora,
    nota: visita.nota,
  });

  const direccionDeLaFotografia = visita.fotoUri;
  if (
    direccionDeLaFotografia !== null &&
    esFotografiaGuardadaEnElTelefono(direccionDeLaFotografia) &&
    existeLaFotografiaEnElTelefono(direccionDeLaFotografia)
  ) {
    const direccionRemota = await subirFotografia(token, direccionDeLaFotografia);
    await actualizarFotoVisita(token, visita.id, direccionRemota);
  }

  await marcarVisitaComoSincronizada(visita.id);
}

export async function subirVisitasPendientes(
  token: string,
  identificadorDelUsuario: string,
): Promise<void> {
  const visitasPendientes = await listarVisitasPendientes(identificadorDelUsuario);

  for (const visita of visitasPendientes) {
    try {
      await subirVisita(token, visita);
    } catch (error) {
      if (error instanceof ErrorConexion) return;
    }
  }
}
