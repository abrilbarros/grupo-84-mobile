import { AvisoInformativo } from "./aviso-informativo";

export function AvisoSinConexion() {
  return (
    <AvisoInformativo
      tipo="informacion"
      mensaje="Estás sin conexión. Te mostramos la última información que guardamos."
    />
  );
}
