import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { NombreDeIcono } from "../modelos/nombre-de-icono";
import { BotonDeAccion } from "./boton-de-accion";

interface PropiedadesDeMensajeDeEstado {
  nombreDelIcono: NombreDeIcono;
  mensaje: string;
  etiquetaDeLaAccion?: string;
  alPresionarLaAccion?: () => void;
}

export function MensajeDeEstado({
  nombreDelIcono,
  mensaje,
  etiquetaDeLaAccion,
  alPresionarLaAccion,
}: PropiedadesDeMensajeDeEstado) {
  const colores = useTheme();

  return (
    <View style={estilos.contenedor}>
      <Ionicons name={nombreDelIcono} size={48} color={colores.primary} />
      <ThemedText style={estilos.mensaje} themeColor="textContent">
        {mensaje}
      </ThemedText>
      {etiquetaDeLaAccion && alPresionarLaAccion && (
        <View style={estilos.accion}>
          <BotonDeAccion
            etiqueta={etiquetaDeLaAccion}
            nombreDelIcono="refresh-outline"
            alPresionar={alPresionarLaAccion}
          />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.four,
  },
  mensaje: {
    textAlign: "center",
  },
  accion: {
    flexDirection: "row",
    alignSelf: "stretch",
  },
});
