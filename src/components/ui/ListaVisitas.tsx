import { useState } from "react";
import { FlatList, StyleSheet } from "react-native";

import type { Visita } from "@/tipos/visita";
import { TarjetaVisita } from "./TarjetaVisita";

import type { Lugar, Categoria } from "@/tipos/recorrido";

type Props = {
  visitas: Visita[];
  lugares: Lugar[];
  categorias: Categoria[];
};

export function ListaVisitas({ visitas, lugares, categorias }: Props) {
  const [visitaExpandida, setVisitaExpandida] = useState<string | null>(null);

  const visitasOrdenadas = [...visitas].sort(
    (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
  );

  const obtenerNombreLugar = (lugarId: string) => {
    const lugar = lugares.find((lugar) => lugar.id === lugarId);

    return lugar ? lugar.nombre : "Lugar desconocido";
  };

  const obtenerNombreCategoria = (lugarId: string) => {
    const lugar = lugares.find((lugar) => lugar.id === lugarId);

    if (!lugar) return "Sin categoría";

    const categoria = categorias.find(
      (categoria) => categoria.id === lugar.categoriaId,
    );

    return categoria ? categoria.nombre : "Sin categoría";
  };

  return (
    <FlatList
      data={visitasOrdenadas}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.lista}
      renderItem={({ item }) => (
        <TarjetaVisita
          visita={item}
          nombreLugar={obtenerNombreLugar(item.lugarId)}
          categoria={obtenerNombreCategoria(item.lugarId)}
          expandida={visitaExpandida === item.id}
          onPress={() =>
            setVisitaExpandida(visitaExpandida === item.id ? null : item.id)
          }
        />
      )}
    />
  );
}


const styles = StyleSheet.create({
  lista: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
});
