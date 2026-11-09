import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { obtenerEvento } from "@/servicios/eventos";
import type { Evento } from "@/tipos/evento";

// Calcula cuánto dura el evento. Si no tiene fin, lo dice.
function textoDuracion(inicio: string, fin: string | null): string {
  if (fin === null) return "Sin hora de fin";
  const minutos =
    (new Date(fin).getTime() - new Date(inicio).getTime()) / 60000;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

// precio 0 = gratis, null = no se sabe (PRD).
function textoPrecio(precio: number | null): string {
  if (precio === null) return "Precio a confirmar";
  if (precio === 0) return "Gratis";
  return `$ ${precio}`;
}

export default function DetalleEventoScreen() {
  const colores = useTheme();
  // El id viene de la dirección: /eventos/evt-017 → id = "evt-017"
  const { id } = useLocalSearchParams<{ id: string }>();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerEvento(id)
      .then((encontrado) => setEvento(encontrado))
      .finally(() => setCargando(false));
  }, [id]);

  return (
    <ThemedView style={styles.contenedor}>
      {/* Muestra la barra de arriba con el botón para volver */}
      <Stack.Screen options={{ headerShown: true, title: "Evento" }} />

      {cargando ? (
        <ActivityIndicator
          size="large"
          color={colores.primary}
          style={styles.centro}
        />
      ) : evento === null ? (
        <ThemedText style={styles.centro}>
          No encontramos este evento.
        </ThemedText>
      ) : (
        <ScrollView contentContainerStyle={styles.contenido}>
          <ThemedText type="subtitle">{evento.titulo}</ThemedText>
          {evento.estado !== "programado" && (
            <ThemedText type="smallBold">Estado: {evento.estado}</ThemedText>
          )}

          <ThemedText type="smallBold">Cuándo empieza</ThemedText>
          <ThemedText>
            {new Date(evento.inicio).toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            a las {evento.inicio.slice(11, 16)}
          </ThemedText>

          <ThemedText type="smallBold">Cuánto dura</ThemedText>
          <ThemedText>{textoDuracion(evento.inicio, evento.fin)}</ThemedText>

          <ThemedText type="smallBold">Dónde</ThemedText>
          <ThemedText>
            {evento.direccionLibre ?? "En un lugar del catálogo"}
          </ThemedText>

          <ThemedText type="smallBold">Precio</ThemedText>
          <ThemedText>{textoPrecio(evento.precio)}</ThemedText>

          <ThemedText type="smallBold">Qué es</ThemedText>
          <ThemedText>{evento.descripcion}</ThemedText>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  contenido: { padding: 16, gap: 8 },
  centro: { marginTop: 32, textAlign: "center" },
});
