import { Linking } from "react-native";

export async function abrirLlamadaTelefonica(telefono: string): Promise<void> {
  const telefonoSinEspacios = telefono.replace(/\s/g, "");
  try {
    await Linking.openURL(`tel:${telefonoSinEspacios}`);
  } catch {
    return;
  }
}
