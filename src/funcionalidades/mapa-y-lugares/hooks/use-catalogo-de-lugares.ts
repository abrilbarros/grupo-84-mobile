import { useCallback, useEffect, useRef, useState } from "react";
import { useEstadoDeRed } from "@/hooks/use-estado-de-red";
import type { Catalogo } from "../modelos/catalogo";
import { leerCatalogoGuardado } from "../servicios/almacenamiento-del-catalogo";
import { descargarCatalogo } from "../servicios/servicio-del-catalogo";
import { indexarCategoriasPorIdentificador } from "../utilidades/indexar-categorias-por-identificador";

export function useCatalogoDeLugares() {
  const { hayInternet } = useEstadoDeRed();
  const [catalogo, setCatalogo] = useState<Catalogo | null>(leerCatalogoGuardado);
  const [estaActualizando, setEstaActualizando] = useState(true);
  const [fallaLaActualizacion, setFallaLaActualizacion] = useState(false);
  const teniaInternetAntes = useRef(hayInternet);

  const actualizarCatalogo = useCallback(async () => {
    setEstaActualizando(true);
    setFallaLaActualizacion(false);
    try {
      setCatalogo(await descargarCatalogo());
    } catch {
      setFallaLaActualizacion(true);
    } finally {
      setEstaActualizando(false);
    }
  }, []);

  useEffect(() => {
    actualizarCatalogo();
  }, [actualizarCatalogo]);

  useEffect(() => {
    if (hayInternet && !teniaInternetAntes.current) actualizarCatalogo();
    teniaInternetAntes.current = hayInternet;
  }, [hayInternet, actualizarCatalogo]);

  const lugares = catalogo?.lugares ?? [];
  const categorias = catalogo?.categorias ?? [];
  const estaMostrandoCopiaGuardada = fallaLaActualizacion && catalogo !== null;

  return {
    lugares,
    categorias,
    categoriasPorIdentificador: indexarCategoriasPorIdentificador(categorias),
    estaCargando: estaActualizando && catalogo === null,
    estaMostrandoCopiaGuardada,
    estaSinConexion: !hayInternet || estaMostrandoCopiaGuardada,
    huboErrorSinCopiaGuardada: fallaLaActualizacion && catalogo === null,
    actualizarCatalogo,
  };
}
