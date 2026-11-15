export function esFotografiaGuardadaEnElTelefono(direccion: string): boolean {
  return !/^https?:\/\//i.test(direccion);
}
