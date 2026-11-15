import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ALTURA_MINIMA_DE_TOQUE } from "../constantes/medidas";
import type { NombreDeIcono } from "../modelos/nombre-de-icono";

interface PropiedadesDeFilaDeInformacion {
  nombreDelIcono: NombreDeIcono;
  etiqueta: string;
  valor: string;
  alPresionar?: () => void;
}

export function FilaDeInformacion({
  nombreDelIcono,
  etiqueta,
  valor,
  alPresionar,
}: PropiedadesDeFilaDeInformacion) {
  const colores = useTheme();

  return (
    <Pressable
      onPress={alPresionar}
      disabled={alPresionar === undefined}
      accessibilityRole={alPresionar ? "button" : "text"}
      accessibilityLabel={`${etiqueta}: ${valor}`}
      style={estilos.fila}
    >
      <Ionicons name={nombreDelIcono} size={26} color={colores.primary} />
      <View style={estilos.textos}>
        <ThemedText type="small" themeColor="textSecondary">
          {etiqueta}
        </ThemedText>
        <ThemedText
          themeColor={alPresionar ? "primary" : "textContent"}
          style={alPresionar ? estilos.valorSubrayado : undefined}
        >
          {valor}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    minHeight: ALTURA_MINIMA_DE_TOQUE,
  },
  textos: {
    flex: 1,
  },
  valorSubrayado: {
    textDecorationLine: "underline",
  },
});
