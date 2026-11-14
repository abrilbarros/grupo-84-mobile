import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import type { Coordenadas } from "@/tipos/coordenadas";
import { DISTANCIA_MINIMA_PARA_ACTUALIZAR_UBICACION_EN_METROS } from "../constantes/cantidades";
import type { EstadoDelPermisoDeUbicacion } from "../modelos/estado-del-permiso-de-ubicacion";

export function useUbicacionDelUsuario() {
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [estadoDelPermiso, setEstadoDelPermiso] =
    useState<EstadoDelPermisoDeUbicacion>("consultando");
  const suscripcionActual = useRef<Location.LocationSubscription | null>(null);
  const estaMontado = useRef(true);

  const comenzarSeguimiento = useCallback(async () => {
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!permiso.granted) {
        setEstadoDelPermiso("denegado");
        return;
      }
      const nuevaSuscripcion = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: DISTANCIA_MINIMA_PARA_ACTUALIZAR_UBICACION_EN_METROS,
        },
        (posicion) =>
          setCoordenadas({
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
          }),
      );
      if (!estaMontado.current) {
        nuevaSuscripcion.remove();
        return;
      }
      suscripcionActual.current?.remove();
      suscripcionActual.current = nuevaSuscripcion;
      setEstadoDelPermiso("concedido");
    } catch {
      setEstadoDelPermiso("no-disponible");
    }
  }, []);

  const solicitarUbicacionNuevamente = useCallback(async () => {
    const permiso = await Location.getForegroundPermissionsAsync();
    if (!permiso.granted && !permiso.canAskAgain) {
      await Linking.openSettings();
      return;
    }
    await comenzarSeguimiento();
  }, [comenzarSeguimiento]);

  useEffect(() => {
    estaMontado.current = true;
    comenzarSeguimiento();
    return () => {
      estaMontado.current = false;
      suscripcionActual.current?.remove();
      suscripcionActual.current = null;
    };
  }, [comenzarSeguimiento]);

  return { coordenadas, estadoDelPermiso, solicitarUbicacionNuevamente };
}
