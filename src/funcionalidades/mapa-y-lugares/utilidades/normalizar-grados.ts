export function normalizarGrados(grados: number): number {
  return ((grados % 360) + 360) % 360;
}
