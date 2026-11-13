import * as Notifications from "expo-notifications";
import Storage from "expo-sqlite/kv-store";
import { Platform } from "react-native";

import type { EstadoEvento, Evento } from "@/tipos/evento";
import { obtenerEvento } from "./eventos";

const MINUTOS_ANTES = 60;
const CLAVE = "eventos-guardados";

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
    } catch {}
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.status === "granted";
}

function leerGuardados(): Record<string, EstadoEvento> {
  try {
    const crudo = Storage.getItemSync(CLAVE);
    return crudo ? JSON.parse(crudo) : {};
  } catch {
    return {};
  }
}

function anotar(id: string, estado: EstadoEvento | null): void {
  const guardados = leerGuardados();
  if (estado === null) delete guardados[id];
  else guardados[id] = estado;
  try {
    Storage.setItemSync(CLAVE, JSON.stringify(guardados));
  } catch {}
}

async function programarRecordatorio(evento: Evento): Promise<void> {
  const inicio = new Date(evento.inicio);
  if (inicio <= new Date()) return;
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
}

async function avisarAhora(titulo: string, cuerpo: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: cuerpo },
    trigger: null,
  });
}

export async function guardarEvento(evento: Evento): Promise<boolean> {
  const permitido = await pedirPermiso();
  if (!permitido) return false;
  anotar(evento.id, evento.estado);
  if (evento.estado === "programado") await programarRecordatorio(evento);
  return true;
}

export async function quitarEvento(id: string): Promise<void> {
  anotar(id, null);
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function estaGuardado(id: string): Promise<boolean> {
  return id in leerGuardados();
}

export async function revisarCambios(): Promise<void> {
  for (const id of Object.keys(leerGuardados())) {
    const evento = await obtenerEvento(id).catch(() => null);
    const antes = leerGuardados()[id];
    if (!evento || antes === undefined || evento.estado === antes) continue;
    anotar(id, evento.estado);
    if (evento.estado === "cancelado") {
      await Notifications.cancelScheduledNotificationAsync(id);
      await avisarAhora("Se canceló un evento que guardaste", evento.titulo);
    } else if (evento.estado === "suspendido") {
      await Notifications.cancelScheduledNotificationAsync(id);
      await avisarAhora("Se suspendió un evento que guardaste", evento.titulo);
    } else if (evento.estado === "programado") {
      await programarRecordatorio(evento);
      await avisarAhora("Se reanudó un evento que guardaste", evento.titulo);
    }
  }
}
