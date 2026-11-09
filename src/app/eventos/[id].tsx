import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { EtiquetaEstado } from "@/components/etiqueta-estado";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { estaGuardado, guardarEvento, quitarEvento } from "@/servicios/avisos";
import { obtenerEvento } from "@/servicios/eventos";
import type { Evento } from "@/tipos/evento";

// Texto del día del evento, por ejemplo "sábado, 14 de noviembre".
// Usamos la fecha escrita en "inicio" (AAAA-MM-DD) para que no cambie con la zona horaria del celular.
function textoDia(inicio: string): string {
  const [anio, mes, dia] = inicio.slice(0, 10).split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

// Calcula cuánto dura el evento. Si no tiene fin, lo dice.
function textoDuracion(inicio: string, fin: string | null): string {
  if (fin === null) return "Sin hora de fin";
  const minutos = (new Date(fin).getTime() - new Date(inicio).getTime()) / 60000;
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
  const [guardado, setGuardado] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    obtenerEvento(id)
      .then((encontrado) => setEvento(encontrado))
      .finally(() => setCargando(false));
    // Al abrir, revisa si este evento ya estaba guardado.
    estaGuardado(id).then((resultado) => setGuardado(resultado));
  }, [id]);

  // Se ejecuta al tocar el botón: guarda o quita el evento.
  async function alTocarGuardar(eventoActual: Evento) {
    if (guardado) {
      await quitarEvento(eventoActual.id);
      setGuardado(false);
      setMensaje(null);
      return;
    }
    const permitido = await guardarEvento(eventoActual);
    if (permitido) {
      setGuardado(true);
      setMensaje("Te vamos a avisar antes de que empiece.");
    } else {
      setMensaje("Activá las notificaciones del celular para recibir el aviso.");
    }
  }

  return (
    <ThemedView style={styles.contenedor}>
      {/* Barra de arriba con el botón para volver, con los colores de la app */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Evento",
          headerStyle: { backgroundColor: colores.background },
          headerTintColor: colores.textContent,
        }}
      />

      {cargando ? (
        <ActivityIndicator size="large" color={colores.primary} style={styles.centro} />
      ) : evento === null ? (
        <ThemedText style={[styles.centro, { color: colores.textContent }]}>No encontramos este evento.</ThemedText>
      ) : (
        <ScrollView contentContainerStyle={styles.contenido}>
          <ThemedText style={[styles.titulo, { color: colores.textContent }]}>{evento.titulo}</ThemedText>
          <EtiquetaEstado estado={evento.estado} />

          {/* Cada dato que pide el PRD: cuándo, cuánto dura, dónde, precio y qué es */}
          <View style={[styles.tarjeta, { borderColor: colores.primary }]}>
            <ThemedText type="smallBold" style={{ color: colores.primary }}>Cuándo empieza</ThemedText>
            <ThemedText style={{ color: colores.textContent }}>
              {textoDia(evento.inicio)} a las {evento.inicio.slice(11, 16)}
            </ThemedText>

            <ThemedText type="smallBold" style={{ color: colores.primary }}>Cuánto dura</ThemedText>
            <ThemedText style={{ color: colores.textContent }}>{textoDuracion(evento.inicio, evento.fin)}</ThemedText>

            <ThemedText type="smallBold" style={{ color: colores.primary }}>Dónde</ThemedText>
            <ThemedText style={{ color: colores.textContent }}>
              {evento.direccionLibre ?? "En un lugar del catálogo"}
            </ThemedText>

            <ThemedText type="smallBold" style={{ color: colores.primary }}>Precio</ThemedText>
            <ThemedText style={{ color: colores.textContent }}>{textoPrecio(evento.precio)}</ThemedText>
          </View>

          <ThemedText type="smallBold" style={{ color: colores.primary }}>Qué es</ThemedText>
          <ThemedText style={{ color: colores.textContent }}>{evento.descripcion}</ThemedText>

          {/* Solo se puede guardar si el evento no está cancelado ni terminado (como en la API) */}
          {(evento.estado === "programado" || evento.estado === "suspendido") && (
            <Pressable
              onPress={() => alTocarGuardar(evento)}
              style={[styles.boton, { backgroundColor: guardado ? colores.secondary : colores.primary }]}
              accessibilityRole="button"
            >
              <ThemedText type="smallBold" style={{ color: guardado ? colores.textContent : colores.onPrimary }}>
                {guardado ? "Guardado ✓ (tocá para quitar)" : "Guardar y avisarme"}
              </ThemedText>
            </Pressable>
          )}
          {mensaje !== null && <ThemedText style={{ color: colores.textContent }}>{mensaje}</ThemedText>}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  contenido: { padding: Spacing.three, gap: Spacing.three },
  centro: { marginTop: Spacing.five, textAlign: "center" },
  titulo: { fontSize: 26, lineHeight: 34, fontWeight: "700" },
  tarjeta: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  boton: { minHeight: 48, borderRadius: 14, padding: Spacing.three, alignItems: "center", justifyContent: "center" },
});
