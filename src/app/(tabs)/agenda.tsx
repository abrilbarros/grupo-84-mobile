import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";

import { EtiquetaEstado } from "@/components/etiqueta-estado";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
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
    setDia((actual) => new Date(actual.getFullYear(), actual.getMonth(), actual.getDate() + cantidad));
  }

  return (
    <ThemedView style={styles.contenedor}>
      {/* Selector de día: botones grandes para usar con una mano (PRD) */}
      <View style={styles.selector}>
        <Pressable
          onPress={() => cambiarDia(-1)}
          style={[styles.botonDia, { backgroundColor: colores.secondary }]}
          accessibilityRole="button"
          accessibilityLabel="Día anterior"
        >
          <Ionicons name="chevron-back" size={24} color={colores.primary} />
        </Pressable>
        <ThemedText style={[styles.textoDia, { color: colores.textContent }]}>
          {dia.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
        </ThemedText>
        <Pressable
          onPress={() => cambiarDia(1)}
          style={[styles.botonDia, { backgroundColor: colores.secondary }]}
          accessibilityRole="button"
          accessibilityLabel="Día siguiente"
        >
          <Ionicons name="chevron-forward" size={24} color={colores.primary} />
        </Pressable>
      </View>

      {/* Los tres estados que pide el TFI: cargando, error y vacío */}
      {cargando ? (
        <ActivityIndicator size="large" color={colores.primary} style={styles.centro} />
      ) : error ? (
        <ThemedText style={[styles.centro, { color: colores.error }]}>{error}</ThemedText>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(evento) => evento.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <ThemedText style={[styles.centro, { color: colores.textContent }]}>No hay eventos este día.</ThemedText>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/eventos/[id]", params: { id: item.id } })}
              accessibilityRole="button"
              style={[styles.tarjeta, { borderColor: colores.primary }]}
            >
              {/* inicio = "2026-11-14T21:00:00-03:00": las posiciones 11 a 16 son la hora */}
              <ThemedText style={[styles.hora, { color: colores.primary }]}>{item.inicio.slice(11, 16)}</ThemedText>
              <ThemedText style={[styles.titulo, { color: colores.textContent }]}>{item.titulo}</ThemedText>
              <EtiquetaEstado estado={item.estado} />
            </Pressable>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: Spacing.three },
  selector: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.three },
  botonDia: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  textoDia: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600" },
  centro: { marginTop: Spacing.five, textAlign: "center" },
  lista: { gap: Spacing.three },
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  hora: { fontSize: 18, fontWeight: "700" },
  titulo: { fontSize: 20, lineHeight: 28, fontWeight: "600" },
});
