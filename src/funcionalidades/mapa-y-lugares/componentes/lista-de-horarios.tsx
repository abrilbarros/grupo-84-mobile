import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { Horario } from "@/tipos/lugar";
import { agruparHorariosPorDia } from "../utilidades/agrupar-horarios-por-dia";

interface PropiedadesDeListaDeHorarios {
  horarios: Horario[];
  diaActual: number;
}

export function ListaDeHorarios({
  horarios,
  diaActual,
}: PropiedadesDeListaDeHorarios) {
  if (horarios.length === 0) {
    return (
      <ThemedText themeColor="textContent">
        Todavía no tenemos los horarios de este lugar. Consultá antes de ir.
      </ThemedText>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {agruparHorariosPorDia(horarios).map(({ dia, nombreDelDia, tramos }) => {
        const tipoDeTexto = dia === diaActual ? "smallBold" : "small";
        return (
          <View key={dia} style={estilos.fila}>
            <ThemedText type={tipoDeTexto} themeColor="textContent" style={estilos.dia}>
              {nombreDelDia}
            </ThemedText>
            <ThemedText type={tipoDeTexto} themeColor="textContent" style={estilos.tramos}>
              {tramos.length > 0 ? tramos.join("  ·  ") : "Cerrado"}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: Spacing.two,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  dia: {
    flex: 1,
  },
  tramos: {
    flex: 2,
    textAlign: "right",
  },
});
