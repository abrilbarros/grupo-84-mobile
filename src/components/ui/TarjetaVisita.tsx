
import { Image, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import type { Visita } from "@/tipos/visita";

type Props = {
  visita: Visita;
  nombreLugar: string;
  categoria: string;
  expandida: boolean;
  onPress: () => void;
};

export function TarjetaVisita({
  visita,
  nombreLugar,
  categoria,
  expandida,
  onPress,
}: Props) {
  const colores = useTheme();

  const fecha = new Date(visita.fechaHora);

  const fechaFormateada = fecha.toLocaleDateString("es-AR");
  const horaFormateada = fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const origen = {
    qr: { texto: "Código QR", icono: "qr-code-outline" as const },
    gps: { texto: "GPS", icono: "navigate-outline" as const },
    manual: { texto: "Manual", icono: "create-outline" as const },
  }[visita.origen];

  return (
    <ThemedView
      style={[
        styles.tarjeta,
        {
          backgroundColor: colores.backgroundElement,
          borderColor: colores.backgroundSelected,
        },
      ]}
    >
      <Pressable onPress={onPress} style={styles.encabezado}>
        <View style={styles.informacion}>
          <ThemedText type="subtitle">{nombreLugar}</ThemedText>

          <View
            style={[
              styles.etiquetaCategoria,
              { backgroundColor: colores.secondary },
            ]}
          >
            <ThemedText
              type="smallBold"
              style={{ color: colores.textContent }}
            >
              {categoria}
            </ThemedText>
          </View>

          <View style={styles.fecha}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={colores.textSecondary}
            />
            <ThemedText type="small" style={{ color: colores.textSecondary }}>
              {fechaFormateada}
            </ThemedText>

            <Ionicons
              name="time-outline"
              size={15}
              color={colores.textSecondary}
            />
            <ThemedText type="small" style={{ color: colores.textSecondary }}>
              {horaFormateada}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.iconoExpandir,
            { backgroundColor: colores.backgroundSelected },
          ]}
        >
          <Ionicons
            name={expandida ? "chevron-up" : "chevron-down"}
            size={20}
            color={colores.text}
          />
        </View>
      </Pressable>

      {expandida && (
        <View
          style={[
            styles.detalle,
            { borderTopColor: colores.backgroundSelected },
          ]}
        >
          <View
            style={[
              styles.etiquetaOrigen,
              { backgroundColor: colores.secondary },
            ]}
          >
            <Ionicons
              name={origen.icono}
              size={16}
              color={colores.textContent}
            />
            <ThemedText
              type="smallBold"
              style={{ color: colores.textContent }}
            >
              Registrada mediante {origen.texto}
            </ThemedText>
          </View>

          <View style={styles.bloqueDetalle}>
            <ThemedText type="smallBold">Nota</ThemedText>
            <ThemedText>
              {visita.nota || "No agregaste ninguna nota."}
            </ThemedText>
          </View>

          {visita.fotoUri && (
            <View style={styles.bloqueDetalle}>
              <ThemedText type="smallBold">Fotografía</ThemedText>
              <Image
                source={{ uri: visita.fotoUri }}
                style={styles.fotografia}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    overflow: "hidden",
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  informacion: {
    flex: 1,
    gap: Spacing.two,
  },
  etiquetaCategoria: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 20,
  },
  fecha: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
    flexWrap: "wrap",
  },
  iconoExpandir: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  detalle: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.three,
  },
  etiquetaOrigen: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 20,
  },
  bloqueDetalle: {
    gap: Spacing.two,
  },
  fotografia: {
    width: "100%",
    height: 190,
    borderRadius: 12,
  },
});
