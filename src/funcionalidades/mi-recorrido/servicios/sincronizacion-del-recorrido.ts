import { descargarVisitasDelServidor } from "./descarga-de-visitas";
import { subirVisitasPendientes } from "./subida-de-visitas-pendientes";

interface SincronizacionEnCurso {
  identificadorDelUsuario: string;
  promesa: Promise<void>;
}

let sincronizacionEnCurso: SincronizacionEnCurso | null = null;

async function ejecutarSincronizacion(
  token: string,
  identificadorDelUsuario: string,
): Promise<void> {
  await subirVisitasPendientes(token, identificadorDelUsuario);
  await descargarVisitasDelServidor(token);
}

export function sincronizarRecorrido(
  token: string,
  identificadorDelUsuario: string,
): Promise<void> {
  if (sincronizacionEnCurso?.identificadorDelUsuario === identificadorDelUsuario) {
    return sincronizacionEnCurso.promesa;
  }

  const promesa: Promise<void> = ejecutarSincronizacion(
    token,
    identificadorDelUsuario,
  ).finally(() => {
    if (sincronizacionEnCurso?.promesa === promesa) sincronizacionEnCurso = null;
  });
  sincronizacionEnCurso = { identificadorDelUsuario, promesa };
  return promesa;
}
