import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ALTURA_MINIMA_DE_TOQUE, RADIO_DE_BORDE } from "../constantes/medidas";
import type { NombreDeIcono } from "../modelos/nombre-de-icono";

interface PropiedadesDeBotonDeAccion {
  etiqueta: string;
  nombreDelIcono: NombreDeIcono;
  alPresionar: () => void;
  variante?: "principal" | "secundario";
}

export function BotonDeAccion({
  etiqueta,
  nombreDelIcono,
  alPresionar,
  variante = "principal",
}: PropiedadesDeBotonDeAccion) {
  const colores = useTheme();
  const esPrincipal = variante === "principal";
  const colorDeFondo = esPrincipal ? colores.primary : colores.secondary;
  const colorDelContenido = esPrincipal ? colores.onPrimary : colores.textContent;

  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={[estilos.boton, { backgroundColor: colorDeFondo }]}
    >
      <Ionicons name={nombreDelIcono} size={22} color={colorDelContenido} />
      <ThemedText type="smallBold" style={{ color: colorDelContenido }}>
        {etiqueta}
      </ThemedText>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    minHeight: ALTURA_MINIMA_DE_TOQUE,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: RADIO_DE_BORDE.mediano,
  },
});
