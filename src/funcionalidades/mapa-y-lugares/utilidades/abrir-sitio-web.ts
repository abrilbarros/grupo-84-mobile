import { Linking } from "react-native";

export async function abrirSitioWeb(direccionDelSitio: string): Promise<void> {
  const tieneProtocolo = /^https?:\/\//i.test(direccionDelSitio);
  const direccionCompleta = tieneProtocolo
    ? direccionDelSitio
    : `https://${direccionDelSitio}`;
  try {
    await Linking.openURL(direccionCompleta);
  } catch {
    return;
  }
}
