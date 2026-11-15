import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ALTURA_MINIMA_DE_TOQUE, RADIO_DE_BORDE } from "../constantes/medidas";
import type { OrdenDeLugares } from "../modelos/orden-de-lugares";

interface OpcionDeOrden {
  orden: OrdenDeLugares;
  etiqueta: string;
}

const OPCIONES_DE_ORDEN: OpcionDeOrden[] = [
  { orden: "distancia", etiqueta: "Más cerca primero" },
  { orden: "nombre", etiqueta: "Por nombre" },
];

interface PropiedadesDeSelectorDeOrden {
  ordenSeleccionado: OrdenDeLugares;
  puedeOrdenarPorDistancia: boolean;
  alCambiarOrden: (orden: OrdenDeLugares) => void;
}

export function SelectorDeOrden({
  ordenSeleccionado,
  puedeOrdenarPorDistancia,
  alCambiarOrden,
}: PropiedadesDeSelectorDeOrden) {
  const colores = useTheme();

  return (
    <View style={estilos.contenedor}>
      {OPCIONES_DE_ORDEN.map(({ orden, etiqueta }) => {
        const estaSeleccionada = orden === ordenSeleccionado;
        const estaDeshabilitada = orden === "distancia" && !puedeOrdenarPorDistancia;
        const colorDelTexto = estaSeleccionada ? colores.onPrimary : colores.textContent;

        return (
          <Pressable
            key={orden}
            onPress={() => alCambiarOrden(orden)}
            disabled={estaDeshabilitada}
            accessibilityRole="button"
            accessibilityLabel={etiqueta}
            accessibilityState={{
              selected: estaSeleccionada,
              disabled: estaDeshabilitada,
            }}
            style={[
              estilos.opcion,
              {
                backgroundColor: estaSeleccionada ? colores.primary : colores.backgroundElement,
                opacity: estaDeshabilitada ? 0.4 : 1,
              },
            ]}
          >
            <ThemedText type="smallBold" style={{ color: colorDelTexto }}>
              {etiqueta}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  opcion: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: ALTURA_MINIMA_DE_TOQUE,
    paddingHorizontal: Spacing.two,
    borderRadius: RADIO_DE_BORDE.mediano,
  },
});
