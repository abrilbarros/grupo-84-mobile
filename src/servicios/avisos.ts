import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { Evento } from "@/tipos/evento";

const MINUTOS_ANTES = 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function pedirPermiso(): Promise<boolean> {
  if (Platform.OS === "android") {
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

export async function guardarEvento(evento: Evento): Promise<boolean> {
  const permitido = await pedirPermiso();
  if (!permitido) return false;

  const inicio = new Date(evento.inicio);
  const momentoAviso = new Date(inicio.getTime() - MINUTOS_ANTES * 60 * 1000);
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

export async function quitarEvento(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function estaGuardado(id: string): Promise<boolean> {
  const programados = await Notifications.getAllScheduledNotificationsAsync();
  return programados.some((aviso) => aviso.identifier === id);
}
