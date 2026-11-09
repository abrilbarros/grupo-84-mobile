import type { RespuestaError } from "@/tipos/api";

export class ErrorApi extends Error {
  constructor(
    public readonly estado: number,
    public readonly codigo: string,
  ) {
    super("La API rechazó la solicitud.");
  }
}

export class ErrorConexion extends Error {
  constructor() {
    super("No pudimos conectar con el servidor. Intentá nuevamente.");
  }
}

// Las pantallas no conocen la URL ni interpretan respuestas HTTP.
export async function solicitar<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("Falta configurar la dirección de la API.");
  const control = new AbortController();
  const cancelar = () => control.abort();
  opciones.signal?.addEventListener("abort", cancelar);
  if (opciones.signal?.aborted) control.abort();
  const espera = setTimeout(cancelar, 15000);
  try {
    let respuesta: Response;
    try {
      respuesta = await fetch(`${base}${ruta}`, {
        ...opciones,
        signal: control.signal,
      });
    } catch {
      throw new ErrorConexion();
    }
    if (respuesta.status === 204) return undefined as T;
    // No se exponen cuerpos internos, trazas ni mensajes técnicos al usuario.
    const cuerpo = await respuesta.json();
    if (!respuesta.ok) {
      const error = cuerpo as Partial<RespuestaError> | null;
      throw new ErrorApi(respuesta.status, error?.error?.codigo ?? "");
    }
    return cuerpo as T;
  } finally {
    clearTimeout(espera);
    opciones.signal?.removeEventListener("abort", cancelar);
  }
}
