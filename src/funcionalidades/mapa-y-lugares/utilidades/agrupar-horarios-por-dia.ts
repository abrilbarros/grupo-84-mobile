import type { Horario } from "@/tipos/lugar";
import {
  NOMBRES_DE_LOS_DIAS,
  ORDEN_DE_LOS_DIAS_DE_LA_SEMANA,
} from "../constantes/nombres-de-los-dias";
import type { HorariosDelDia } from "../modelos/horarios-del-dia";

export function agruparHorariosPorDia(horarios: Horario[]): HorariosDelDia[] {
  return ORDEN_DE_LOS_DIAS_DE_LA_SEMANA.map((dia) => ({
    dia,
    nombreDelDia: NOMBRES_DE_LOS_DIAS[dia],
    tramos: horarios
      .filter((horario) => horario.dia === dia)
      .sort((primero, segundo) => primero.abre.localeCompare(segundo.abre))
      .map((horario) => `${horario.abre} a ${horario.cierra}`),
  }));
}
