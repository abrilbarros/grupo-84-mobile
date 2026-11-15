import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { RADIO_DE_BORDE } from "../constantes/medidas";

const ALTURA_DE_LA_BARRA = 8;
const PORCENTAJE_COMPLETO = 100;

interface PropiedadesDeBarraDeProgresoDeAudio {
  segundosReproducidos: number;
  segundosTotales: number;
}

export function BarraDeProgresoDeAudio({
  segundosReproducidos,
  segundosTotales,
}: PropiedadesDeBarraDeProgresoDeAudio) {
  const colores = useTheme();
  const proporcionReproducida =
    segundosTotales > 0 ? Math.min(1, segundosReproducidos / segundosTotales) : 0;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Avance de la audioguía"
      accessibilityValue={{
        min: 0,
        max: Math.round(segundosTotales),
        now: Math.round(segundosReproducidos),
      }}
      style={[estilos.pista, { backgroundColor: colores.backgroundSelected }]}
    >
      <View
        style={[
          estilos.relleno,
          {
            width: `${proporcionReproducida * PORCENTAJE_COMPLETO}%`,
            backgroundColor: colores.primary,
          },
        ]}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pista: {
    height: ALTURA_DE_LA_BARRA,
    borderRadius: RADIO_DE_BORDE.circular,
    overflow: "hidden",
  },
  relleno: {
    height: ALTURA_DE_LA_BARRA,
    borderRadius: RADIO_DE_BORDE.circular,
  },
});
