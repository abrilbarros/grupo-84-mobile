import { AvisoInformativo } from "./aviso-informativo";

export function AvisoDeFavoritos() {
  return (
    <AvisoInformativo
      tipo="advertencia"
      mensaje="No pudimos actualizar tus favoritos. Probá de nuevo en un rato."
    />
  );
}
