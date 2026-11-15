import { Linking, Platform } from "react-native";
import type { Coordenadas } from "@/tipos/coordenadas";

function construirDireccionNativa({ latitud, longitud }: Coordenadas): string {
  if (Platform.OS === "ios") {
    return `http://maps.apple.com/?daddr=${latitud},${longitud}`;
  }
  return `google.navigation:q=${latitud},${longitud}`;
}

function construirDireccionWeb({ latitud, longitud }: Coordenadas): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`;
}

export async function abrirAplicacionDeMapas(
  destino: Coordenadas,
): Promise<void> {
  if (Platform.OS === "web") {
    await Linking.openURL(construirDireccionWeb(destino));
    return;
  }
  try {
    await Linking.openURL(construirDireccionNativa(destino));
  } catch {
    await Linking.openURL(construirDireccionWeb(destino));
  }
}
