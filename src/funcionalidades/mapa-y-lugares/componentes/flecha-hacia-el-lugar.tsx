import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Coordenadas } from "@/tipos/coordenadas";
import { useOrientacionDelDispositivo } from "../hooks/use-orientacion-del-dispositivo";
import { calcularRumboEnGrados } from "../utilidades/calcular-rumbo-en-grados";
import { normalizarGrados } from "../utilidades/normalizar-grados";

interface PropiedadesDeFlechaHaciaElLugar {
  ubicacionDelUsuario: Coordenadas | null;
  destino: Coordenadas;
}

export function FlechaHaciaElLugar({
  ubicacionDelUsuario,
  destino,
}: PropiedadesDeFlechaHaciaElLugar) {
  const colores = useTheme();
  const orientacionDelDispositivo = useOrientacionDelDispositivo(
    ubicacionDelUsuario !== null,
  );

  if (ubicacionDelUsuario === null || orientacionDelDispositivo === null) {
    return null;
  }

  const rumboHaciaElLugar = calcularRumboEnGrados(ubicacionDelUsuario, destino);
  const giroDeLaFlecha = normalizarGrados(
    rumboHaciaElLugar - orientacionDelDispositivo,
  );

  return (
    <View
      style={estilos.contenedor}
      accessible
      accessibilityLabel="Flecha que indica hacia dónde queda el lugar"
    >
      <View style={{ transform: [{ rotate: `${giroDeLaFlecha}deg` }] }}>
        <Ionicons name="arrow-up-circle" size={44} color={colores.primary} />
      </View>
      <ThemedText type="small" themeColor="textContent">
        Seguí la flecha para llegar
      </ThemedText>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});
