import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { RADIO_DE_BORDE } from "../constantes/medidas";

const LADO_DEL_BOTON = 56;

interface PropiedadesDeBotonDeCentradoEnUbicacion {
  alPresionar: () => void;
}

export function BotonDeCentradoEnUbicacion({
  alPresionar,
}: PropiedadesDeBotonDeCentradoEnUbicacion) {
  const colores = useTheme();

  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityLabel="Ir a mi ubicación"
      style={[
        estilos.boton,
        { backgroundColor: colores.primary },
      ]}
    >
      <Ionicons name="locate" size={28} color={colores.onPrimary} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: "center",
    justifyContent: "center",
    width: LADO_DEL_BOTON,
    height: LADO_DEL_BOTON,
    borderRadius: RADIO_DE_BORDE.circular,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
