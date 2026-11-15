import type { OrigenVisita } from "@/tipos/visita";

export interface FilaDeVisita {
  id: string;
  usuario_id: string;
  lugar_id: string;
  fecha_hora: string;
  origen: OrigenVisita;
  foto_uri: string | null;
  nota: string | null;
  sincronizada: number;
}
