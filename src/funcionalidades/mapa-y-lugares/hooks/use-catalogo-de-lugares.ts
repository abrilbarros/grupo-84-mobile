import { useCallback, useEffect, useState } from "react";
import type { Catalogo } from "../modelos/catalogo";
import { leerCatalogoGuardado } from "../servicios/almacenamiento-del-catalogo";
import { descargarCatalogo } from "../servicios/servicio-del-catalogo";
import { indexarCategoriasPorIdentificador } from "../utilidades/indexar-categorias-por-identificador";

export function useCatalogoDeLugares() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(leerCatalogoGuardado);
  const [estaActualizando, setEstaActualizando] = useState(true);
  const [fallaLaActualizacion, setFallaLaActualizacion] = useState(false);

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

  const lugares = catalogo?.lugares ?? [];
  const categorias = catalogo?.categorias ?? [];

  return {
    lugares,
    categorias,
    categoriasPorIdentificador: indexarCategoriasPorIdentificador(categorias),
    estaCargando: estaActualizando && catalogo === null,
    estaMostrandoCopiaGuardada: fallaLaActualizacion && catalogo !== null,
    huboErrorSinCopiaGuardada: fallaLaActualizacion && catalogo === null,
    actualizarCatalogo,
  };
}
