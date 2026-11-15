import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import {
  EXTENSION_POR_DEFECTO_DE_LAS_FOTOGRAFIAS,
  NOMBRE_DE_LA_CARPETA_DE_FOTOGRAFIAS,
} from "../constantes/almacenamiento-local";

function obtenerCarpetaDeFotografias(): Directory {
  const carpeta = new Directory(
    Paths.document,
    NOMBRE_DE_LA_CARPETA_DE_FOTOGRAFIAS,
  );
  if (!carpeta.exists) {
    carpeta.create({ intermediates: true, idempotent: true });
  }
  return carpeta;
}

export async function guardarFotografiaEnElTelefono(
  direccionTemporalDeLaFotografia: string,
  identificadorDeLaVisita: string,
): Promise<string> {
  if (Platform.OS === "web") return direccionTemporalDeLaFotografia;

  const archivoTemporal = new File(direccionTemporalDeLaFotografia);
  const extension =
    archivoTemporal.extension || EXTENSION_POR_DEFECTO_DE_LAS_FOTOGRAFIAS;
  const archivoPermanente = new File(
    obtenerCarpetaDeFotografias(),
    `${identificadorDeLaVisita}${extension}`,
  );
  await archivoTemporal.copy(archivoPermanente);
  return archivoPermanente.uri;
}

export function existeLaFotografiaEnElTelefono(direccion: string): boolean {
  if (Platform.OS === "web") return false;
  return new File(direccion).exists;
}
