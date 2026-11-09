import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { EstadoEvento } from "@/tipos/evento";

// Cartelito de color con el estado del evento. Lo usan la lista y el detalle.
// Si el evento está "programado" no muestra nada.
export function EtiquetaEstado({ estado }: { estado: EstadoEvento }) {
  const colores = useTheme();
  if (estado === "programado") return null;

  // Cancelado en rojo; suspendido y finalizado en color arena.
  const fondo = estado === "cancelado" ? colores.errorBackground : colores.detail;
  const texto = estado === "cancelado" ? colores.error : colores.textContent;
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
