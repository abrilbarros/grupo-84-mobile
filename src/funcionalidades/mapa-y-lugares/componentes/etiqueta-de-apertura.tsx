import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { RADIO_DE_BORDE } from "../constantes/medidas";
import type { EstadoDeApertura } from "../modelos/estado-de-apertura";

interface PropiedadesDeEtiquetaDeApertura {
  estadoDeApertura: EstadoDeApertura | null;
}

export function EtiquetaDeApertura({
  estadoDeApertura,
}: PropiedadesDeEtiquetaDeApertura) {
  const colores = useTheme();
  if (estadoDeApertura === null) return null;

  const { estaAbierto, horaDeCierre } = estadoDeApertura;
  const colorDeFondo = estaAbierto ? colores.secondary : colores.errorBackground;
  const colorDelTexto = estaAbierto ? colores.textContent : colores.error;
  const texto = estaAbierto
    ? `Abierto ahora - cierra ${horaDeCierre}`
    : "Cerrado ahora";

  return (
    <View style={[estilos.etiqueta, { backgroundColor: colorDeFondo }]}>
      <Ionicons
        name={estaAbierto ? "time-outline" : "close-circle-outline"}
        size={20}
        color={colorDelTexto}
      />
      <ThemedText type="smallBold" style={{ color: colorDelTexto }}>
        {texto}
      </ThemedText>
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: RADIO_DE_BORDE.circular,
  },
});
