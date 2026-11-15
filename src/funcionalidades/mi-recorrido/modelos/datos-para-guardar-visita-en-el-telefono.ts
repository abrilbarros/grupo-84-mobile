import type { OrigenVisita } from "@/tipos/visita";

export interface DatosParaGuardarVisitaEnElTelefono {
  usuarioId: string;
  lugarId: string;
  origen: OrigenVisita;
  nota: string | null;
  direccionTemporalDeLaFotografia: string | null;
}
