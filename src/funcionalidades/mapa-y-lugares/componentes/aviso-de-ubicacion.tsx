import type { EstadoDelPermisoDeUbicacion } from "../modelos/estado-del-permiso-de-ubicacion";
import { AvisoInformativo } from "./aviso-informativo";

interface PropiedadesDeAvisoDeUbicacion {
  estadoDelPermiso: EstadoDelPermisoDeUbicacion;
  alSolicitarUbicacion: () => void;
}

export function AvisoDeUbicacion({
  estadoDelPermiso,
  alSolicitarUbicacion,
}: PropiedadesDeAvisoDeUbicacion) {
  if (estadoDelPermiso === "denegado") {
    return (
      <AvisoInformativo
        tipo="advertencia"
        mensaje="Sin tu ubicación no podemos decirte qué tenés cerca, pero podés recorrer todos los lugares igual."
        etiquetaDeLaAccion="Activar ubicación"
        alPresionarLaAccion={alSolicitarUbicacion}
      />
    );
  }

  if (estadoDelPermiso === "no-disponible") {
    return (
      <AvisoInformativo
        tipo="advertencia"
        mensaje="No pudimos encontrar dónde estás. Revisá que el GPS esté prendido."
        etiquetaDeLaAccion="Reintentar"
        alPresionarLaAccion={alSolicitarUbicacion}
      />
    );
  }

  return null;
}
