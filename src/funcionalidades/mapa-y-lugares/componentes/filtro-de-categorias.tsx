import { ScrollView, StyleSheet } from "react-native";
import { Spacing } from "@/constants/theme";
import type { Categoria } from "@/tipos/categoria";
import { obtenerNombreDeIconoDeCategoria } from "../utilidades/obtener-nombre-de-icono-de-categoria";
import { ChipDeCategoria } from "./chip-de-categoria";

interface PropiedadesDeFiltroDeCategorias {
  categorias: Categoria[];
  identificadoresDeCategoriasSeleccionadas: string[];
  alAlternarCategoria: (identificadorDeCategoria: string) => void;
  alMostrarTodasLasCategorias: () => void;
}

export function FiltroDeCategorias({
  categorias,
  identificadoresDeCategoriasSeleccionadas,
  alAlternarCategoria,
  alMostrarTodasLasCategorias,
}: PropiedadesDeFiltroDeCategorias) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={estilos.desplazador}
      contentContainerStyle={estilos.contenido}
    >
      <ChipDeCategoria
        etiqueta="Todas"
        nombreDelIcono="apps-outline"
        estaSeleccionado={identificadoresDeCategoriasSeleccionadas.length === 0}
        alPresionar={alMostrarTodasLasCategorias}
      />
      {categorias.map((categoria) => (
        <ChipDeCategoria
          key={categoria.id}
          etiqueta={categoria.nombre}
          nombreDelIcono={obtenerNombreDeIconoDeCategoria(categoria)}
          estaSeleccionado={identificadoresDeCategoriasSeleccionadas.includes(
            categoria.id,
          )}
          alPresionar={() => alAlternarCategoria(categoria.id)}
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  desplazador: {
    flexGrow: 0,
    flexShrink: 0,
  },
  contenido: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
