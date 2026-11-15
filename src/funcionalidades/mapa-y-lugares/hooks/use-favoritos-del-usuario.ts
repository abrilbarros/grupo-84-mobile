import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useSesion } from "@/contextos/sesion";
import type { ControlDeFavoritos } from "../modelos/control-de-favoritos";
import {
  alternarFavorito,
  establecerCuentaDeFavoritos,
  obtenerEstadoDeFavoritos,
  recargarFavoritos,
  suscribirseAFavoritos,
} from "../servicios/almacen-de-favoritos";

export interface FavoritosDelUsuario extends ControlDeFavoritos {
  huboError: boolean;
}

export function useFavoritosDelUsuario(): FavoritosDelUsuario {
  const { sesion } = useSesion();
  const token = sesion?.token ?? null;
  const estadoDeFavoritos = useSyncExternalStore(
    suscribirseAFavoritos,
    obtenerEstadoDeFavoritos,
  );

  useEffect(() => {
    establecerCuentaDeFavoritos(token);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void recargarFavoritos();
    }, []),
  );

  function esFavorito(identificadorDelLugar: string): boolean {
    return estadoDeFavoritos.identificadoresDeLugaresFavoritos.includes(
      identificadorDelLugar,
    );
  }

  function estaProcesando(identificadorDelLugar: string): boolean {
    return (
      estadoDeFavoritos.estaCargando ||
      estadoDeFavoritos.identificadoresDeLugaresEnProceso.includes(
        identificadorDelLugar,
      )
    );
  }

  function alPresionarFavorito(identificadorDelLugar: string): void {
    if (token === null) {
      router.push("/login");
      return;
    }
    void alternarFavorito(identificadorDelLugar);
  }

  return {
    huboError: estadoDeFavoritos.huboError,
    esFavorito,
    estaProcesando,
    alPresionarFavorito,
  };
}
