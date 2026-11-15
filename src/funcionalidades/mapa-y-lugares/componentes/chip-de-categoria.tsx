import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ALTURA_MINIMA_DE_TOQUE, RADIO_DE_BORDE } from "../constantes/medidas";
import type { NombreDeIcono } from "../modelos/nombre-de-icono";

interface PropiedadesDeChipDeCategoria {
  etiqueta: string;
  nombreDelIcono: NombreDeIcono;
  estaSeleccionado: boolean;
  alPresionar: () => void;
}

export function ChipDeCategoria({
  etiqueta,
  nombreDelIcono,
  estaSeleccionado,
  alPresionar,
}: PropiedadesDeChipDeCategoria) {
  const colores = useTheme();
  const colorDeFondo = estaSeleccionado ? colores.primary : colores.background;
  const colorDelContenido = estaSeleccionado ? colores.onPrimary : colores.textContent;

  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por ${etiqueta}`}
      accessibilityState={{ selected: estaSeleccionado }}
      style={[
        estilos.chip,
        { backgroundColor: colorDeFondo, borderColor: colores.primary },
      ]}
    >
      <Ionicons name={nombreDelIcono} size={20} color={colorDelContenido} />
      <ThemedText type="smallBold" style={{ color: colorDelContenido }}>
        {etiqueta}
      </ThemedText>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: ALTURA_MINIMA_DE_TOQUE,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: RADIO_DE_BORDE.circular,
  },
});
