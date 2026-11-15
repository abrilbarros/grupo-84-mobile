import { Magnetometer } from "expo-sensors";
import { useEffect, useState } from "react";
import { INTERVALO_DE_LECTURA_DE_LA_BRUJULA_EN_MILISEGUNDOS } from "../constantes/cantidades";
import { calcularOrientacionDelMagnetometro } from "../utilidades/calcular-orientacion-del-magnetometro";

export function useOrientacionDelDispositivo(estaActivo: boolean): number | null {
  const [orientacionEnGrados, setOrientacionEnGrados] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!estaActivo) return;
    let seDesmontoElComponente = false;
    let suscripcion: { remove: () => void } | null = null;

    Magnetometer.isAvailableAsync()
      .then((estaDisponible) => {
        if (!estaDisponible || seDesmontoElComponente) return;
        Magnetometer.setUpdateInterval(
          INTERVALO_DE_LECTURA_DE_LA_BRUJULA_EN_MILISEGUNDOS,
        );
        suscripcion = Magnetometer.addListener(
          ({ x: ejeHorizontal, y: ejeVertical }) =>
            setOrientacionEnGrados(
              calcularOrientacionDelMagnetometro(ejeHorizontal, ejeVertical),
            ),
        );
      })
      .catch(() => undefined);

    return () => {
      seDesmontoElComponente = true;
      suscripcion?.remove();
    };
  }, [estaActivo]);

  return estaActivo ? orientacionEnGrados : null;
}
