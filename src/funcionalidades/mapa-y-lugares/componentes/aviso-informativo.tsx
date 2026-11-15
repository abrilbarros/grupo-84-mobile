import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ALTURA_MINIMA_DE_TOQUE, RADIO_DE_BORDE } from "../constantes/medidas";

interface PropiedadesDeAvisoInformativo {
  mensaje: string;
  tipo: "informacion" | "advertencia";
  etiquetaDeLaAccion?: string;
  alPresionarLaAccion?: () => void;
}

export function AvisoInformativo({
  mensaje,
  tipo,
  etiquetaDeLaAccion,
  alPresionarLaAccion,
}: PropiedadesDeAvisoInformativo) {
  const colores = useTheme();
  const esAdvertencia = tipo === "advertencia";
  const colorDeFondo = esAdvertencia ? colores.warningBackground : colores.secondary;
  const colorDelTexto = esAdvertencia ? colores.warning : colores.textContent;

  return (
    <View style={[estilos.contenedor, { backgroundColor: colorDeFondo }]}>
      <ThemedText type="small" style={{ color: colorDelTexto }}>
        {mensaje}
      </ThemedText>
      {etiquetaDeLaAccion && alPresionarLaAccion && (
        <Pressable
          onPress={alPresionarLaAccion}
          accessibilityRole="button"
          accessibilityLabel={etiquetaDeLaAccion}
          style={estilos.accion}
        >
          <ThemedText type="smallBold" style={{ color: colorDelTexto }}>
            {etiquetaDeLaAccion}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: RADIO_DE_BORDE.mediano,
  },
  accion: {
    justifyContent: "center",
    minHeight: ALTURA_MINIMA_DE_TOQUE,
  },
});
