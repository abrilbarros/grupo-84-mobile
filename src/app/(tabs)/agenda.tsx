import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { listarEventos } from "@/servicios/eventos";
import type { Evento } from "@/tipos/evento";

// Convierte una fecha al formato "AAAA-MM-DD" que usa el servicio.
// No usamos toISOString() porque pasa a hora UTC y de noche cambiaría el día.
function aTextoFecha(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export default function AgendaScreen() {
  const colores = useTheme();

  // Estado de la pantalla. El PRD pide empezar por hoy.
  const [dia, setDia] = useState(new Date());
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que cambia el día, pide los eventos de ese día al servicio.
  useEffect(() => {
    setCargando(true);
    setError(null);
    listarEventos(aTextoFecha(dia))
      .then((lista) => setEventos(lista))
      .catch(() => setError("No pudimos cargar los eventos. Probá de nuevo."))
      .finally(() => setCargando(false));
  }, [dia]);

  // Suma o resta días (cantidad = 1 o -1).
  function cambiarDia(cantidad: number) {
    setDia(
      (actual) =>
        new Date(
          actual.getFullYear(),
          actual.getMonth(),
          actual.getDate() + cantidad,
        ),
    );
  }

  return (
    <ThemedView style={styles.contenedor}>
      {/* Selector de día: botones grandes para usar con una mano */}
      <View style={styles.selector}>
        <Pressable
          onPress={() => cambiarDia(-1)}
          style={styles.botonDia}
          accessibilityRole="button"
          accessibilityLabel="Día anterior"
        >
          <ThemedText type="subtitle" themeColor="primary">
            ‹
          </ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={styles.textoDia}>
          {dia.toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </ThemedText>
        <Pressable
          onPress={() => cambiarDia(1)}
          style={styles.botonDia}
          accessibilityRole="button"
          accessibilityLabel="Día siguiente"
        >
          <ThemedText type="subtitle" themeColor="primary">
            ›
          </ThemedText>
        </Pressable>
      </View>

      {/* Los tres estados que pide el TFI (requisito 3): cargando, error y vacío */}
      {cargando ? (
        <ActivityIndicator
          size="large"
          color={colores.primary}
          style={styles.centro}
        />
      ) : error ? (
        <ThemedText style={styles.centro}>{error}</ThemedText>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(evento) => evento.id}
          ListEmptyComponent={
            <ThemedText style={styles.centro}>
              No hay eventos este día.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.tarjeta,
                { backgroundColor: colores.backgroundElement },
              ]}
            >
              {/* inicio = "2026-11-14T21:00:00-03:00": las posiciones 11 a 16 son la hora */}
              <ThemedText type="smallBold">
                {item.inicio.slice(11, 16)}
              </ThemedText>
              <ThemedText>{item.titulo}</ThemedText>
              {item.estado !== "programado" && (
                <ThemedText type="small">Estado: {item.estado}</ThemedText>
              )}
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 16 },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  botonDia: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  textoDia: { flex: 1, textAlign: "center" },
  centro: { marginTop: 32, textAlign: "center" },
  tarjeta: { padding: 16, borderRadius: 12, marginBottom: 12, gap: 4 },
});
