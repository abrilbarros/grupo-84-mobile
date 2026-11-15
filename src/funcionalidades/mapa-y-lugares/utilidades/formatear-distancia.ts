const METROS_POR_KILOMETRO = 1000;

export function formatearDistancia(distanciaEnMetros: number): string {
  const metrosRedondeados = Math.round(distanciaEnMetros);
  if (metrosRedondeados < METROS_POR_KILOMETRO) {
    return `${metrosRedondeados} m`;
  }
  const kilometros = (distanciaEnMetros / METROS_POR_KILOMETRO).toFixed(1);
  return `${kilometros.replace(".", ",")} km`;
}
