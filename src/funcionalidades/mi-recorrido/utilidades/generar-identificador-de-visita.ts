const PREFIJO_DE_LAS_VISITAS = "vis-";
const BASE_ALFANUMERICA = 36;
const PRIMER_DIGITO_ALEATORIO = 2;
const CANTIDAD_DE_DIGITOS_ALEATORIOS = 8;

export function generarIdentificadorDeVisita(): string {
  const marcaDeTiempo = Date.now().toString(BASE_ALFANUMERICA);
  const sufijoAleatorio = Math.random()
    .toString(BASE_ALFANUMERICA)
    .slice(
      PRIMER_DIGITO_ALEATORIO,
      PRIMER_DIGITO_ALEATORIO + CANTIDAD_DE_DIGITOS_ALEATORIOS,
    );
  return `${PREFIJO_DE_LAS_VISITAS}${marcaDeTiempo}${sufijoAleatorio}`;
}
