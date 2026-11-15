import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ALTURA_MINIMA_DE_TOQUE } from "../constantes/medidas";

interface PropiedadesDeBotonDeFavorito {
  esFavorito: boolean;
  estaDeshabilitado: boolean;
  alPresionar: () => void;
}

export function BotonDeFavorito({
  esFavorito,
  estaDeshabilitado,
  alPresionar,
}: PropiedadesDeBotonDeFavorito) {
  const colores = useTheme();

  return (
    <Pressable
      onPress={alPresionar}
      disabled={estaDeshabilitado}
      accessibilityRole="button"
      accessibilityLabel={
        esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"
      }
      accessibilityState={{ selected: esFavorito, disabled: estaDeshabilitado }}
      style={[estilos.boton, { opacity: estaDeshabilitado ? 0.5 : 1 }]}
    >
      <Ionicons
        name={esFavorito ? "heart" : "heart-outline"}
        size={30}
        color={esFavorito ? colores.error : colores.primary}
      />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: ALTURA_MINIMA_DE_TOQUE,
    minHeight: ALTURA_MINIMA_DE_TOQUE,
  },
});
