const SEGUNDOS_POR_MINUTO = 60;

export function formatearDuracionDeAudio(totalDeSegundos: number): string {
  const segundosRedondeados = Math.max(0, Math.round(totalDeSegundos));
  const minutos = Math.floor(segundosRedondeados / SEGUNDOS_POR_MINUTO);
  const segundos = segundosRedondeados % SEGUNDOS_POR_MINUTO;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}
