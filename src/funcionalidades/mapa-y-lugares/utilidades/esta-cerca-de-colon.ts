import type { Coordenadas } from "@/tipos/coordenadas";
import { COORDENADAS_DEL_CENTRO_DE_COLON } from "../constantes/centro-de-colon";
import { DISTANCIA_MAXIMA_PARA_CENTRAR_EN_EL_USUARIO_EN_METROS } from "../constantes/cantidades";
import { calcularDistanciaEnMetros } from "./calcular-distancia-en-metros";

export function estaCercaDeColon(ubicacionDelUsuario: Coordenadas): boolean {
  return (
    calcularDistanciaEnMetros(
      ubicacionDelUsuario,
      COORDENADAS_DEL_CENTRO_DE_COLON,
    ) <= DISTANCIA_MAXIMA_PARA_CENTRAR_EN_EL_USUARIO_EN_METROS
  );
}
