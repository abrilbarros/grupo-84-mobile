import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ALTURA_MINIMA_DE_TOQUE, RADIO_DE_BORDE } from "../constantes/medidas";

interface PropiedadesDeCampoDeBusqueda {
  valor: string;
  alCambiarValor: (texto: string) => void;
}

export function CampoDeBusqueda({
  valor,
  alCambiarValor,
}: PropiedadesDeCampoDeBusqueda) {
  const colores = useTheme();

  return (
    <View
      style={[
        estilos.contenedor,
        { backgroundColor: colores.backgroundElement, borderColor: colores.primary },
      ]}
    >
      <Ionicons name="search-outline" size={24} color={colores.primary} />
      <TextInput
        value={valor}
        onChangeText={alCambiarValor}
        placeholder="Buscar un lugar por nombre"
        placeholderTextColor={colores.textSecondary}
        accessibilityLabel="Buscar un lugar por nombre"
        returnKeyType="search"
        autoCorrect={false}
        style={[estilos.campo, { color: colores.text }]}
      />
      {valor !== "" && (
        <Pressable
          onPress={() => alCambiarValor("")}
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
          style={estilos.botonDeBorrado}
        >
          <Ionicons name="close-circle" size={24} color={colores.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: ALTURA_MINIMA_DE_TOQUE,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: RADIO_DE_BORDE.mediano,
  },
  campo: {
    flex: 1,
    fontSize: 18,
    paddingVertical: Spacing.two,
  },
  botonDeBorrado: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: ALTURA_MINIMA_DE_TOQUE,
    minHeight: ALTURA_MINIMA_DE_TOQUE,
  },
});
