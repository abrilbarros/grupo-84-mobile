import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { Audioguia } from "@/tipos/lugar";
import { useReproductorDeAudioguia } from "../hooks/use-reproductor-de-audioguia";
import { formatearDuracionDeAudio } from "../utilidades/formatear-duracion-de-audio";
import { BarraDeProgresoDeAudio } from "./barra-de-progreso-de-audio";
import { BotonDeAccion } from "./boton-de-accion";

interface PropiedadesDeReproductorDeAudioguia {
  audioguia: Audioguia;
}

export function ReproductorDeAudioguia({
  audioguia,
}: PropiedadesDeReproductorDeAudioguia) {
  const {
    estaReproduciendo,
    segundosReproducidos,
    segundosTotales,
    alternarReproduccion,
  } = useReproductorDeAudioguia(audioguia);

  const etiquetaDelBoton = estaReproduciendo
    ? "Pausar audioguía"
    : `Escuchar audioguía ${formatearDuracionDeAudio(segundosTotales)}`;
  const segundosRestantes = segundosTotales - segundosReproducidos;

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.acciones}>
        <BotonDeAccion
          etiqueta={etiquetaDelBoton}
          nombreDelIcono={
            estaReproduciendo ? "pause-circle-outline" : "play-circle-outline"
          }
          alPresionar={alternarReproduccion}
        />
      </View>
      <BarraDeProgresoDeAudio
        segundosReproducidos={segundosReproducidos}
        segundosTotales={segundosTotales}
      />
      <View style={estilos.tiempos}>
        <ThemedText type="small" themeColor="textSecondary">
          {formatearDuracionDeAudio(segundosReproducidos)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Faltan {formatearDuracionDeAudio(segundosRestantes)}
        </ThemedText>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: Spacing.two,
  },
  acciones: {
    flexDirection: "row",
  },
  tiempos: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
