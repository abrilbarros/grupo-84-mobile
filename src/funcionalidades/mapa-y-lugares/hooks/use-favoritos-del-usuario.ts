import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useSesion } from "@/contextos/sesion";
import { agregarFavorito, quitarFavorito } from "@/servicios/favoritos";
import { descargarIdentificadoresDeLugaresFavoritos } from "../servicios/servicio-de-favoritos-del-usuario";

export function useFavoritosDelUsuario() {
  const { sesion } = useSesion();
  const token = sesion?.token ?? null;
  const [identificadoresDeLugaresFavoritos, setIdentificadoresDeLugaresFavoritos] =
    useState<string[]>([]);
  const [tokenConFavoritosCargados, setTokenConFavoritosCargados] = useState<
    string | null
  >(null);
  const [identificadorDelLugarEnProceso, setIdentificadorDelLugarEnProceso] =
    useState<string | null>(null);
  const [huboError, setHuboError] = useState(false);

  useEffect(() => {
    if (token === null) {
      setIdentificadoresDeLugaresFavoritos([]);
      return;
    }
    const controlDeCancelacion = new AbortController();
    descargarIdentificadoresDeLugaresFavoritos(token, controlDeCancelacion.signal)
      .then(setIdentificadoresDeLugaresFavoritos)
      .catch(() => {
        if (!controlDeCancelacion.signal.aborted) setHuboError(true);
      })
      .finally(() => {
        if (!controlDeCancelacion.signal.aborted) {
          setTokenConFavoritosCargados(token);
        }
      });
    return () => controlDeCancelacion.abort();
  }, [token]);

  async function alternarFavorito(identificadorDelLugar: string) {
    if (token === null || identificadorDelLugarEnProceso !== null) return;
    const eraFavorito =
      identificadoresDeLugaresFavoritos.includes(identificadorDelLugar);

    setHuboError(false);
    setIdentificadorDelLugarEnProceso(identificadorDelLugar);
    setIdentificadoresDeLugaresFavoritos((identificadoresActuales) =>
      eraFavorito
        ? identificadoresActuales.filter(
            (identificador) => identificador !== identificadorDelLugar,
          )
        : [...identificadoresActuales, identificadorDelLugar],
    );

    try {
      const senalDeCancelacion = new AbortController().signal;
      if (eraFavorito) {
        await quitarFavorito(token, identificadorDelLugar, senalDeCancelacion);
      } else {
        await agregarFavorito(token, identificadorDelLugar, senalDeCancelacion);
      }
    } catch {
      setIdentificadoresDeLugaresFavoritos((identificadoresActuales) =>
        eraFavorito
          ? [...identificadoresActuales, identificadorDelLugar]
          : identificadoresActuales.filter(
              (identificador) => identificador !== identificadorDelLugar,
            ),
      );
      setHuboError(true);
    } finally {
      setIdentificadorDelLugarEnProceso(null);
    }
  }

  function esFavorito(identificadorDelLugar: string): boolean {
    return identificadoresDeLugaresFavoritos.includes(identificadorDelLugar);
  }

  function alPresionarFavorito(identificadorDelLugar: string) {
    if (token === null) {
      router.push("/login");
      return;
    }
    alternarFavorito(identificadorDelLugar);
  }

  const estaCargandoFavoritos =
    token !== null && tokenConFavoritosCargados !== token;

  return {
    huboError,
    estaOcupado:
      estaCargandoFavoritos || identificadorDelLugarEnProceso !== null,
    esFavorito,
    alPresionarFavorito,
  };
}
