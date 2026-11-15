import type { Visita } from "@/tipos/visita";
import type { FilaDeVisita } from "../modelos/fila-de-visita";

export function convertirFilaAVisita(fila: FilaDeVisita): Visita {
  return {
    id: fila.id,
    usuarioId: fila.usuario_id,
    lugarId: fila.lugar_id,
    fechaHora: fila.fecha_hora,
    origen: fila.origen,
    fotoUri: fila.foto_uri,
    nota: fila.nota,
    sincronizada: fila.sincronizada === 1,
  };
}
