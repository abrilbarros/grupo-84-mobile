import type { ReactNode } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { Categoria } from "@/tipos/categoria";
import { CANTIDAD_DE_LUGARES_CERCANOS_A_MOSTRAR } from "../constantes/cantidades";
import type { LugarConDistancia } from "../modelos/lugar-con-distancia";
import { BotonDeAccion } from "./boton-de-accion";
import { MensajeDeEstado } from "./mensaje-de-estado";
import { TarjetaDeLugar } from "./tarjeta-de-lugar";

interface PropiedadesDeListaDeLugaresCercanos {
  titulo: string;
  lugaresConDistancia: LugarConDistancia[];
  categoriasPorIdentificador: Record<string, Categoria>;
  avisos: ReactNode;
  alPresionarLugar: (identificadorDelLugar: string) => void;
  alVerTodosLosLugares: () => void;
}

export function ListaDeLugaresCercanos({
  titulo,
  lugaresConDistancia,
  categoriasPorIdentificador,
  avisos,
  alPresionarLugar,
  alVerTodosLosLugares,
}: PropiedadesDeListaDeLugaresCercanos) {
  return (
    <FlatList
      data={lugaresConDistancia.slice(0, CANTIDAD_DE_LUGARES_CERCANOS_A_MOSTRAR)}
      keyExtractor={(elemento) => elemento.lugar.id}
      contentContainerStyle={estilos.contenido}
      ListHeaderComponent={
        <View style={estilos.encabezado}>
          {avisos}
          <ThemedText type="subtitle" style={estilos.titulo}>
            {titulo}
          </ThemedText>
        </View>
      }
      ListEmptyComponent={
        <MensajeDeEstado
          nombreDelIcono="search-outline"
          mensaje="No encontramos lugares en esas categorías. Probá con otras."
        />
      }
      ListFooterComponent={
        <View style={estilos.pie}>
          <BotonDeAccion
            etiqueta="Ver todos los lugares"
            nombreDelIcono="list-outline"
            alPresionar={alVerTodosLosLugares}
          />
        </View>
      }
      renderItem={({ item }) => (
        <TarjetaDeLugar
          lugarConDistancia={item}
          categoria={categoriasPorIdentificador[item.lugar.categoriaId]}
          alPresionar={alPresionarLugar}
        />
      )}
    />
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  encabezado: {
    gap: Spacing.three,
  },
  titulo: {
    fontSize: 24,
    lineHeight: 32,
  },
  pie: {
    flexDirection: "row",
  },
});
