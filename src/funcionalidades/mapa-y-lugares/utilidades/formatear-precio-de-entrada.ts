export function formatearPrecioDeEntrada(precioDeEntrada: number | null): string | null {
  if (precioDeEntrada === null) return null;
  if (precioDeEntrada === 0) return "Gratis";
  return `$ ${precioDeEntrada.toLocaleString("es-AR")}`;
}
