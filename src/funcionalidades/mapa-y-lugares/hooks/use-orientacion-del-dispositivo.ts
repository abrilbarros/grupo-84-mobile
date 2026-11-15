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
    Magnetometer.setUpdateInterval(
      INTERVALO_DE_LECTURA_DE_LA_BRUJULA_EN_MILISEGUNDOS,
    );
    const suscripcion = Magnetometer.addListener(
      ({ x: ejeHorizontal, y: ejeVertical }) =>
        setOrientacionEnGrados(
          calcularOrientacionDelMagnetometro(ejeHorizontal, ejeVertical),
        ),
    );
    return () => suscripcion.remove();
  }, [estaActivo]);

  return estaActivo ? orientacionEnGrados : null;
}
