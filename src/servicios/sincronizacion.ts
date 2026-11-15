import {
  registrarVisita,
  subirFotografia,
  actualizarFotoVisita,
} from "@/servicios/recorrido";

import {
  obtenerVisitasPendientes,
  marcarVisitaSincronizada,
} from "@/servicios/recorrido-local";

import { hayConexion } from "@/servicios/conexion";

// Envía al servidor las visitas que quedaron pendientes.
export async function sincronizarVisitas(
  token: string,
): Promise<void> {
  const conectado = await hayConexion();

  if (!conectado) {
    return;
  }

  const pendientes = await obtenerVisitasPendientes();

  for (const visita of pendientes) {
    try {
      const visitaServidor = await registrarVisita(
        token,
        visita.lugarId,
        visita.origen,
        visita.nota,
        null,
        visita.fechaHora,
      );

      if (visita.fotoUri) {
        const urlFoto = await subirFotografia(
          token,
          visita.fotoUri,
        );

        await actualizarFotoVisita(
          token,
          visitaServidor.id,
          urlFoto,
        );
      }

      await marcarVisitaSincronizada(visita.id);

      console.log(
        "Visita sincronizada:",
        visita.id,
      );
    } catch (error) {
      console.error(
        "No se pudo sincronizar la visita:",
        visita.id,
        error,
      );
    }
  }
}