import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { EstadoEvento } from "@/tipos/evento";

export function EtiquetaEstado({ estado }: { estado: EstadoEvento }) {
  const colores = useTheme();
  if (estado === "programado") return null;

  const fondo =
    estado === "cancelado"
      ? colores.errorBackground
      : estado === "suspendido"
        ? colores.warningBackground
        : colores.backgroundSelected;
  const texto = estado === "cancelado" ? colores.error : estado === "suspendido" ? colores.warning : colores.textContent;
  const nombre = { suspendido: "Suspendido", cancelado: "Cancelado", finalizado: "Finalizado" }[estado];

  return (
    <View style={[styles.etiqueta, { backgroundColor: fondo }]}>
      <ThemedText type="smallBold" style={{ color: texto }}>
        {nombre}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
});
