import { agregarFavorito, quitarFavorito } from "@/servicios/favoritos";
import type { EstadoDeFavoritos } from "../modelos/estado-de-favoritos";
import { descargarIdentificadoresDeLugaresFavoritos } from "./servicio-de-favoritos-del-usuario";

const ESTADO_INICIAL: EstadoDeFavoritos = {
  identificadoresDeLugaresFavoritos: [],
  identificadoresDeLugaresEnProceso: [],
  estaCargando: false,
  huboError: false,
};

let tokenDeLaCuenta: string | null = null;
let generacionDeLaCuenta = 0;
let versionDeLosDatos = 0;
let recargaEnCurso: Promise<void> | null = null;
let estadoActual: EstadoDeFavoritos = ESTADO_INICIAL;
const lugaresEnProceso = new Set<string>();
const oyentes = new Set<() => void>();

function actualizarEstado(cambios: Partial<EstadoDeFavoritos>): void {
  estadoActual = { ...estadoActual, ...cambios };
  oyentes.forEach((oyente) => oyente());
}

function agregarIdentificador(
  identificadores: string[],
  identificadorDelLugar: string,
): string[] {
  return identificadores.includes(identificadorDelLugar)
    ? identificadores
    : [...identificadores, identificadorDelLugar];
}

function quitarIdentificador(
  identificadores: string[],
  identificadorDelLugar: string,
): string[] {
  return identificadores.filter(
    (identificador) => identificador !== identificadorDelLugar,
  );
}

async function ejecutarRecarga(token: string): Promise<void> {
  const generacionAlIniciar = generacionDeLaCuenta;
  const versionAlIniciar = versionDeLosDatos;
  const eraLaCargaInicial = estadoActual.estaCargando;

  try {
    const identificadoresDescargados =
      await descargarIdentificadoresDeLugaresFavoritos(
        token,
        new AbortController().signal,
      );
    if (generacionAlIniciar !== generacionDeLaCuenta) return;
    const siguenVigentesLosDatos = versionAlIniciar === versionDeLosDatos;
    actualizarEstado({
      identificadoresDeLugaresFavoritos: siguenVigentesLosDatos
        ? identificadoresDescargados
        : estadoActual.identificadoresDeLugaresFavoritos,
      estaCargando: false,
      huboError: false,
    });
  } catch {
    if (generacionAlIniciar !== generacionDeLaCuenta) return;
    actualizarEstado({
      estaCargando: false,
      huboError: eraLaCargaInicial ? true : estadoActual.huboError,
    });
  }
}

export function obtenerEstadoDeFavoritos(): EstadoDeFavoritos {
  return estadoActual;
}

export function suscribirseAFavoritos(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function recargarFavoritos(): Promise<void> {
  const token = tokenDeLaCuenta;
  if (token === null) return Promise.resolve();
  if (recargaEnCurso !== null) return recargaEnCurso;

  const recarga: Promise<void> = ejecutarRecarga(token).finally(() => {
    if (recargaEnCurso === recarga) recargaEnCurso = null;
  });
  recargaEnCurso = recarga;
  return recarga;
}

export function establecerCuentaDeFavoritos(token: string | null): void {
  if (token === tokenDeLaCuenta) return;

  tokenDeLaCuenta = token;
  generacionDeLaCuenta += 1;
  versionDeLosDatos += 1;
  recargaEnCurso = null;
  lugaresEnProceso.clear();
  actualizarEstado({ ...ESTADO_INICIAL, estaCargando: token !== null });
  void recargarFavoritos();
}

export async function alternarFavorito(
  identificadorDelLugar: string,
): Promise<void> {
  const token = tokenDeLaCuenta;
  if (
    token === null ||
    estadoActual.estaCargando ||
    lugaresEnProceso.has(identificadorDelLugar)
  ) {
    return;
  }

  const generacionAlIniciar = generacionDeLaCuenta;
  const eraFavorito =
    estadoActual.identificadoresDeLugaresFavoritos.includes(
      identificadorDelLugar,
    );

  lugaresEnProceso.add(identificadorDelLugar);
  versionDeLosDatos += 1;
  actualizarEstado({
    huboError: false,
    identificadoresDeLugaresEnProceso: [...lugaresEnProceso],
    identificadoresDeLugaresFavoritos: eraFavorito
      ? quitarIdentificador(
          estadoActual.identificadoresDeLugaresFavoritos,
          identificadorDelLugar,
        )
      : agregarIdentificador(
          estadoActual.identificadoresDeLugaresFavoritos,
          identificadorDelLugar,
        ),
  });

  try {
    const senalDeCancelacion = new AbortController().signal;
    if (eraFavorito) {
      await quitarFavorito(token, identificadorDelLugar, senalDeCancelacion);
    } else {
      await agregarFavorito(token, identificadorDelLugar, senalDeCancelacion);
    }
  } catch {
    if (generacionAlIniciar === generacionDeLaCuenta) {
      actualizarEstado({
        huboError: true,
        identificadoresDeLugaresFavoritos: eraFavorito
          ? agregarIdentificador(
              estadoActual.identificadoresDeLugaresFavoritos,
              identificadorDelLugar,
            )
          : quitarIdentificador(
              estadoActual.identificadoresDeLugaresFavoritos,
              identificadorDelLugar,
            ),
      });
    }
  } finally {
    if (generacionAlIniciar === generacionDeLaCuenta) {
      lugaresEnProceso.delete(identificadorDelLugar);
      versionDeLosDatos += 1;
      actualizarEstado({
        identificadoresDeLugaresEnProceso: [...lugaresEnProceso],
      });
    }
  }
}
