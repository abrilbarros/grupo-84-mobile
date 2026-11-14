import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatearDistancia } from "../utilidades/formatear-distancia";

interface PropiedadesDeEtiquetaDeDistancia {
  distanciaEnMetros: number | null;
}

export function EtiquetaDeDistancia({
  distanciaEnMetros,
}: PropiedadesDeEtiquetaDeDistancia) {
  const colores = useTheme();
  if (distanciaEnMetros === null) return null;

  const distanciaFormateada = formatearDistancia(distanciaEnMetros);

  return (
    <View
      style={estilos.contenedor}
      accessible
      accessibilityLabel={`A ${distanciaFormateada} de donde estás`}
    >
      <Ionicons name="walk-outline" size={20} color={colores.primary} />
      <ThemedText type="smallBold" style={{ color: colores.primary }}>
        {distanciaFormateada}
      </ThemedText>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
});
