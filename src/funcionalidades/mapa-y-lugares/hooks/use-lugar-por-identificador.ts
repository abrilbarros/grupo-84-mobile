import { useEffect, useState } from "react";
import type { Lugar } from "@/tipos/lugar";
import { leerCatalogoGuardado } from "../servicios/almacenamiento-del-catalogo";
import { descargarLugarPorIdentificador } from "../servicios/servicio-de-lugares";

function buscarLugarEnElCatalogoGuardado(identificadorDelLugar: string) {
  const catalogoGuardado = leerCatalogoGuardado();
  return (
    catalogoGuardado?.lugares.find((lugar) => lugar.id === identificadorDelLugar) ??
    null
  );
}

export function useLugarPorIdentificador(identificadorDelLugar: string) {
  const [lugar, setLugar] = useState<Lugar | null>(() =>
    buscarLugarEnElCatalogoGuardado(identificadorDelLugar),
  );
  const [estaDescargando, setEstaDescargando] = useState(true);
  const [noExiste, setNoExiste] = useState(false);
  const [fallaLaDescarga, setFallaLaDescarga] = useState(false);

  useEffect(() => {
    const controlDeCancelacion = new AbortController();
    descargarLugarPorIdentificador(
      identificadorDelLugar,
      controlDeCancelacion.signal,
    )
      .then((lugarDescargado) => {
        if (lugarDescargado === null || !lugarDescargado.activo) {
          setLugar(null);
          setNoExiste(true);
          return;
        }
        setLugar(lugarDescargado);
      })
      .catch(() => {
        if (!controlDeCancelacion.signal.aborted) setFallaLaDescarga(true);
      })
      .finally(() => {
        if (!controlDeCancelacion.signal.aborted) setEstaDescargando(false);
      });
    return () => controlDeCancelacion.abort();
  }, [identificadorDelLugar]);

  return {
    lugar,
    estaCargando: estaDescargando && lugar === null,
    noExiste,
    huboErrorSinCopiaGuardada: fallaLaDescarga && lugar === null,
  };
}
