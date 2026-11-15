import { obtenerMisVisitas } from "@/servicios/recorrido";
import { guardarVisitasDelServidor } from "./repositorio-de-visitas";

export async function descargarVisitasDelServidor(token: string): Promise<void> {
  const visitasDelServidor = await obtenerMisVisitas(token);
  await guardarVisitasDelServidor(visitasDelServidor);
}
