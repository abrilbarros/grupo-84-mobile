import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { Evento } from "@/tipos/evento";

// Cuántos minutos antes del inicio avisamos. El PRD no lo dice: es una duda para el foro.
const MINUTOS_ANTES = 60;

// Hace que el aviso se muestre aunque la app esté abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Pide permiso para mostrar avisos. En Android el canal se crea ANTES de pedir permiso (como en clase).
async function pedirPermiso(): Promise<boolean> {
  if (Platform.OS === "android") {
    // En Expo Go (SDK 57) crear el canal falla; si pasa, seguimos con el canal que trae Expo Go.
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Avisos de eventos",
        importance: Notifications.AndroidImportance.MAX,
      });
    } catch {
      console.warn("No se pudo crear el canal de avisos (normal en Expo Go).");
    }
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.status === "granted";
}

// Guarda el evento programando un aviso antes de que empiece.
// Usamos el id del evento como id del aviso: así después sabemos si está guardado.
// Devuelve false si la persona no dio permiso.
export async function guardarEvento(evento: Evento): Promise<boolean> {
  const permitido = await pedirPermiso();
  if (!permitido) return false;

  const inicio = new Date(evento.inicio);
  const momentoAviso = new Date(inicio.getTime() - MINUTOS_ANTES * 60 * 1000);
  // Si falta menos de una hora, avisamos en 5 segundos.
  const fecha = momentoAviso > new Date() ? momentoAviso : new Date(Date.now() + 5000);

  await Notifications.scheduleNotificationAsync({
    identifier: evento.id,
    content: {
      title: "Tu evento empieza pronto",
      body: `${evento.titulo} · ${evento.inicio.slice(11, 16)} h`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fecha },
  });
  return true;
}

// Quita el evento guardado: cancela su aviso.
export async function quitarEvento(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

// Dice si el evento está guardado: si tiene un aviso programado con su id.
export async function estaGuardado(id: string): Promise<boolean> {
  const programados = await Notifications.getAllScheduledNotificationsAsync();
  return programados.some((aviso) => aviso.identifier === id);
}
