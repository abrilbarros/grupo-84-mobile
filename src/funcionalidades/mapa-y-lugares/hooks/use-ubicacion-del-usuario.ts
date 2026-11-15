import { useSyncExternalStore } from "react";
import {
  obtenerEstadoDeUbicacion,
  solicitarUbicacionNuevamente,
  suscribirseALaUbicacion,
} from "../servicios/seguimiento-de-ubicacion";

export function useUbicacionDelUsuario() {
  const estadoDeUbicacion = useSyncExternalStore(
    suscribirseALaUbicacion,
    obtenerEstadoDeUbicacion,
  );

  return {
    coordenadas: estadoDeUbicacion.coordenadas,
    estadoDelPermiso: estadoDeUbicacion.estadoDelPermiso,
    solicitarUbicacionNuevamente,
  };
}
