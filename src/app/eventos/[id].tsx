import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { EtiquetaEstado } from "@/components/etiqueta-estado";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSesion } from "@/contextos/sesion";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { estaGuardado, guardarEvento, quitarEvento } from "@/servicios/avisos";
import { cambiarEstadoEvento, leerEventoGuardado, obtenerEvento } from "@/servicios/eventos";
import { obtenerLugar } from "@/servicios/lugares";
import type { Evento } from "@/tipos/evento";

function textoDia(inicio: string): string {
  const [anio, mes, dia] = inicio.slice(0, 10).split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

function textoDuracion(inicio: string, fin: string | null): string {
  if (fin === null) return "Sin hora de fin";
  const minutos = (new Date(fin).getTime() - new Date(inicio).getTime()) / 60000;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

function textoPrecio(precio: number | null): string {
  if (precio === null) return "Precio a confirmar";
  if (precio === 0) return "Gratis";
  return `$ ${precio}`;
}

function esAdmin(token: string): boolean {
  try {
    const parte = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(parte)).rol === "admin";
  } catch {
    return false;
  }
}

export default function DetalleEventoScreen() {
  const colores = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [nombreLugar, setNombreLugar] = useState<string | null>(null);
  const { sesion } = useSesion();
  const admin = sesion !== null && esAdmin(sesion.token);

  useEffect(() => {
    const control = new AbortController();
    obtenerEvento(id)
      .then((encontrado) => {
        setEvento(encontrado);
        if (encontrado?.lugarId) {
          obtenerLugar(encontrado.lugarId, control.signal)
            .then((lugar) => setNombreLugar(lugar.nombre))
            .catch(() => {});
        }
      })
      .catch(() => {
        const copia = leerEventoGuardado(id);
        if (copia) setEvento(copia);
        else setError(true);
      })
      .finally(() => setCargando(false));
    estaGuardado(id).then((resultado) => setGuardado(resultado));
    return () => control.abort();
  }, [id]);

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

  async function alCambiarEstado(eventoActual: Evento, nuevo: "programado" | "suspendido" | "cancelado") {
    if (sesion === null) return;
    try {
      setEvento(await cambiarEstadoEvento(eventoActual.id, nuevo, sesion.token));
      setMensaje(null);
    } catch {
      setMensaje("No pudimos cambiar el estado. Intentá de nuevo.");
    }
  }

  function confirmarCambio(eventoActual: Evento, nuevo: "programado" | "suspendido" | "cancelado") {
    const accion = nuevo === "cancelado" ? "cancelar" : nuevo === "suspendido" ? "suspender" : "reanudar";
    Alert.alert("Confirmar", `¿Seguro que querés ${accion} este evento?`, [
      { text: "No", style: "cancel" },
      { text: "Sí", onPress: () => alCambiarEstado(eventoActual, nuevo) },
    ]);
  }

  return (
    <ThemedView style={styles.contenedor}>
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
      ) : error ? (
        <ThemedText style={[styles.centro, { color: colores.textContent }]}>
          No pudimos cargar el evento. Revisá tu conexión.
        </ThemedText>
      ) : evento === null ? (
        <ThemedText style={[styles.centro, { color: colores.textContent }]}>No encontramos este evento.</ThemedText>
      ) : (
        <ScrollView contentContainerStyle={styles.contenido}>
          {evento.imagenUrl ? (
            <Image source={{ uri: evento.imagenUrl }} style={styles.imagen} contentFit="cover" />
          ) : (
            <View style={[styles.imagen, styles.sinImagen, { backgroundColor: colores.secondary }]}>
              <Ionicons name="calendar-outline" size={48} color={colores.primary} />
            </View>
          )}
          <ThemedText style={[styles.titulo, { color: colores.textContent }]}>{evento.titulo}</ThemedText>
          <EtiquetaEstado estado={evento.estado} />

          <View style={[styles.tarjeta, { borderColor: colores.primary }]}>
            <View style={styles.filaTitulo}>
              <Ionicons name="time-outline" size={22} color={colores.primary} />
              <ThemedText style={[styles.tituloDato, { color: colores.primary }]}>Cuándo empieza</ThemedText>
            </View>
            <ThemedText style={{ color: colores.textContent }}>
              {textoDia(evento.inicio)} a las {evento.inicio.slice(11, 16)} hs
            </ThemedText>

            <View style={styles.filaTitulo}>
              <Ionicons name="hourglass-outline" size={22} color={colores.primary} />
              <ThemedText style={[styles.tituloDato, { color: colores.primary }]}>Cuánto dura</ThemedText>
            </View>
            <ThemedText style={{ color: colores.textContent }}>{textoDuracion(evento.inicio, evento.fin)}</ThemedText>

            <View style={styles.filaTitulo}>
              <Ionicons name="location-outline" size={22} color={colores.primary} />
              <ThemedText style={[styles.tituloDato, { color: colores.primary }]}>Dónde</ThemedText>
            </View>
            <ThemedText style={{ color: colores.textContent }}>
              {evento.direccionLibre ?? nombreLugar ?? "En un lugar del catálogo"}
            </ThemedText>

            <View style={styles.filaTitulo}>
              <Ionicons name="pricetag-outline" size={22} color={colores.primary} />
              <ThemedText style={[styles.tituloDato, { color: colores.primary }]}>Precio</ThemedText>
            </View>
            <ThemedText style={{ color: colores.textContent }}>{textoPrecio(evento.precio)}</ThemedText>
          </View>

          <ThemedText style={[styles.tituloDato, { color: colores.primary }]}>Qué es</ThemedText>
          <ThemedText style={{ color: colores.textContent }}>{evento.descripcion}</ThemedText>

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
          {admin && (evento.estado === "programado" || evento.estado === "suspendido") && (
            <View style={styles.filaBotones}>
              <Pressable
                onPress={() => confirmarCambio(evento, evento.estado === "programado" ? "suspendido" : "programado")}
                style={[styles.botonAdmin, { borderColor: colores.primary }]}
                role="button"
              >
                <ThemedText type="smallBold" style={{ color: colores.primary }}>
                  {evento.estado === "programado" ? "Suspender" : "Reanudar"}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => confirmarCambio(evento, "cancelado")}
                style={[styles.botonAdmin, { borderColor: colores.error }]}
                role="button"
              >
                <ThemedText type="smallBold" style={{ color: colores.error }}>
                  Cancelar evento
                </ThemedText>
              </Pressable>
            </View>
          )}
          {admin && evento.estado === "cancelado" && (
            <View style={styles.filaBotones}>
              <Pressable
                onPress={() => confirmarCambio(evento, "programado")}
                style={[styles.botonAdmin, { borderColor: colores.primary }]}
                role="button"
              >
                <ThemedText type="smallBold" style={{ color: colores.primary }}>
                  Reactivar evento
                </ThemedText>
              </Pressable>
            </View>
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
  imagen: { width: "100%", height: 100, borderRadius: 12 },
  sinImagen: { alignItems: "center", justifyContent: "center" },
  tituloDato: { fontSize: 16, fontWeight: "800" },
  filaTitulo: { flexDirection: "row", alignItems: "center", gap: Spacing.one },
  filaBotones: { flexDirection: "row", gap: Spacing.two },
  botonAdmin: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  boton: { minHeight: 48, borderRadius: 14, padding: Spacing.three, alignItems: "center", justifyContent: "center" },
});
