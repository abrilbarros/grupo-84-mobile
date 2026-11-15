import Storage from "expo-sqlite/kv-store";
import { CLAVE_DEL_CATALOGO_GUARDADO } from "../constantes/claves-de-almacenamiento";
import type { Catalogo } from "../modelos/catalogo";

export function guardarCatalogo(catalogo: Catalogo): void {
  try {
    Storage.setItemSync(CLAVE_DEL_CATALOGO_GUARDADO, JSON.stringify(catalogo));
  } catch {
    return;
  }
}

export function leerCatalogoGuardado(): Catalogo | null {
  try {
    const textoGuardado = Storage.getItemSync(CLAVE_DEL_CATALOGO_GUARDADO);
    return textoGuardado === null ? null : JSON.parse(textoGuardado);
  } catch {
    return null;
  }
}
