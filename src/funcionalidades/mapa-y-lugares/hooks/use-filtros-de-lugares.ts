import { useState } from "react";

export function useFiltrosDeLugares() {
  const [identificadoresDeCategoriasSeleccionadas, setIdentificadoresDeCategoriasSeleccionadas] =
    useState<string[]>([]);
  const [textoDeBusqueda, setTextoDeBusqueda] = useState("");

  function alternarCategoria(identificadorDeCategoria: string) {
    setIdentificadoresDeCategoriasSeleccionadas((seleccionadasActuales) =>
      seleccionadasActuales.includes(identificadorDeCategoria)
        ? seleccionadasActuales.filter(
            (identificador) => identificador !== identificadorDeCategoria,
          )
        : [...seleccionadasActuales, identificadorDeCategoria],
    );
  }

  function mostrarTodasLasCategorias() {
    setIdentificadoresDeCategoriasSeleccionadas([]);
  }

  return {
    identificadoresDeCategoriasSeleccionadas,
    textoDeBusqueda,
    alternarCategoria,
    mostrarTodasLasCategorias,
    cambiarTextoDeBusqueda: setTextoDeBusqueda,
  };
}
