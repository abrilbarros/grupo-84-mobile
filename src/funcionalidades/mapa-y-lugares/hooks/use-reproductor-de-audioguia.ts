import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect } from "react";
import type { Audioguia } from "@/tipos/lugar";
import { permitirReproduccionEnSegundoPlano } from "../servicios/configuracion-de-audio";

const MARGEN_PARA_VOLVER_A_EMPEZAR_EN_SEGUNDOS = 0.5;
const POSICION_INICIAL_EN_SEGUNDOS = 0;

export function useReproductorDeAudioguia(audioguia: Audioguia) {
  const reproductor = useAudioPlayer(audioguia.url);
  const estadoDelReproductor = useAudioPlayerStatus(reproductor);

  useEffect(() => {
    permitirReproduccionEnSegundoPlano().catch(() => undefined);
  }, []);

  const segundosTotales =
    estadoDelReproductor.duration > 0
      ? estadoDelReproductor.duration
      : audioguia.duracionSegundos;
  const segundosReproducidos = Math.min(
    estadoDelReproductor.currentTime,
    segundosTotales,
  );
  const terminoLaReproduccion =
    segundosReproducidos >=
    segundosTotales - MARGEN_PARA_VOLVER_A_EMPEZAR_EN_SEGUNDOS;

  async function alternarReproduccion(): Promise<void> {
    if (estadoDelReproductor.playing) {
      reproductor.pause();
      return;
    }
    if (terminoLaReproduccion) {
      await reproductor.seekTo(POSICION_INICIAL_EN_SEGUNDOS);
    }
    reproductor.play();
  }

  return {
    estaReproduciendo: estadoDelReproductor.playing,
    segundosReproducidos,
    segundosTotales,
    alternarReproduccion,
  };
}
