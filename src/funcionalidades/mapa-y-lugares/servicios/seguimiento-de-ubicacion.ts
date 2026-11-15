import * as Location from "expo-location";
import { Linking } from "react-native";
import type { Coordenadas } from "@/tipos/coordenadas";
import { DISTANCIA_MINIMA_PARA_ACTUALIZAR_UBICACION_EN_METROS } from "../constantes/cantidades";
import type { EstadoDelPermisoDeUbicacion } from "../modelos/estado-del-permiso-de-ubicacion";

export interface EstadoDeUbicacion {
  coordenadas: Coordenadas | null;
  estadoDelPermiso: EstadoDelPermisoDeUbicacion;
}

let estadoActual: EstadoDeUbicacion = {
  coordenadas: null,
  estadoDelPermiso: "consultando",
};
const oyentes = new Set<() => void>();
let suscripcionActual: Location.LocationSubscription | null = null;

function actualizarEstado(cambios: Partial<EstadoDeUbicacion>) {
  estadoActual = { ...estadoActual, ...cambios };
  oyentes.forEach((oyente) => oyente());
}

async function comenzarSeguimiento(): Promise<void> {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) {
      actualizarEstado({ estadoDelPermiso: "denegado" });
      return;
    }
    const nuevaSuscripcion = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: DISTANCIA_MINIMA_PARA_ACTUALIZAR_UBICACION_EN_METROS,
      },
      (posicion) =>
        actualizarEstado({
          coordenadas: {
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
          },
        }),
    );
    if (oyentes.size === 0) {
      nuevaSuscripcion.remove();
      return;
    }
    suscripcionActual?.remove();
    suscripcionActual = nuevaSuscripcion;
    actualizarEstado({ estadoDelPermiso: "concedido" });
  } catch {
    actualizarEstado({ estadoDelPermiso: "no-disponible" });
  }
}

function detenerSeguimiento(): void {
  suscripcionActual?.remove();
  suscripcionActual = null;
}

export function obtenerEstadoDeUbicacion(): EstadoDeUbicacion {
  return estadoActual;
}

export function suscribirseALaUbicacion(oyente: () => void): () => void {
  oyentes.add(oyente);
  if (oyentes.size === 1) comenzarSeguimiento();
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0) detenerSeguimiento();
  };
}

export async function solicitarUbicacionNuevamente(): Promise<void> {
  const permiso = await Location.getForegroundPermissionsAsync();
  if (!permiso.granted && !permiso.canAskAgain) {
    await Linking.openSettings();
    return;
  }
  await comenzarSeguimiento();
}
