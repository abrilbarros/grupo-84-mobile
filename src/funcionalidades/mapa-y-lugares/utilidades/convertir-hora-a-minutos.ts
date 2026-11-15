export const MINUTOS_POR_HORA = 60;

export function convertirHoraAMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * MINUTOS_POR_HORA + minutos;
}
