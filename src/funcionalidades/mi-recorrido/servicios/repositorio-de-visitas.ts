import type { Visita } from "@/tipos/visita";
import { NOMBRE_DE_LA_TABLA_DE_VISITAS } from "../constantes/almacenamiento-local";
import type { FilaDeVisita } from "../modelos/fila-de-visita";
import { obtenerBaseDeDatosLocal } from "./base-de-datos-local";
import { convertirFilaAVisita } from "./mapeador-de-visitas";

const COLUMNAS_DE_LA_VISITA =
  "id, usuario_id, lugar_id, fecha_hora, origen, foto_uri, nota, sincronizada";

export async function guardarVisitaLocal(visita: Visita): Promise<void> {
  const baseDeDatos = await obtenerBaseDeDatosLocal();
  await baseDeDatos.runAsync(
    `INSERT INTO ${NOMBRE_DE_LA_TABLA_DE_VISITAS} (${COLUMNAS_DE_LA_VISITA})
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    visita.id,
    visita.usuarioId,
    visita.lugarId,
    visita.fechaHora,
    visita.origen,
    visita.fotoUri,
    visita.nota,
    visita.sincronizada ? 1 : 0,
  );
}

export async function listarVisitasLocales(
  identificadorDelUsuario: string,
): Promise<Visita[]> {
  const baseDeDatos = await obtenerBaseDeDatosLocal();
  const filas = await baseDeDatos.getAllAsync<FilaDeVisita>(
    `SELECT ${COLUMNAS_DE_LA_VISITA} FROM ${NOMBRE_DE_LA_TABLA_DE_VISITAS}
     WHERE usuario_id = ? ORDER BY fecha_hora DESC`,
    identificadorDelUsuario,
  );
  return filas.map(convertirFilaAVisita);
}

export async function listarVisitasPendientes(
  identificadorDelUsuario: string,
): Promise<Visita[]> {
  const baseDeDatos = await obtenerBaseDeDatosLocal();
  const filas = await baseDeDatos.getAllAsync<FilaDeVisita>(
    `SELECT ${COLUMNAS_DE_LA_VISITA} FROM ${NOMBRE_DE_LA_TABLA_DE_VISITAS}
     WHERE usuario_id = ? AND sincronizada = 0 ORDER BY fecha_hora ASC`,
    identificadorDelUsuario,
  );
  return filas.map(convertirFilaAVisita);
}

export async function marcarVisitaComoSincronizada(
  identificadorDeLaVisita: string,
): Promise<void> {
  const baseDeDatos = await obtenerBaseDeDatosLocal();
  await baseDeDatos.runAsync(
    `UPDATE ${NOMBRE_DE_LA_TABLA_DE_VISITAS} SET sincronizada = 1 WHERE id = ?`,
    identificadorDeLaVisita,
  );
}

export async function guardarVisitasDelServidor(
  visitasDelServidor: Visita[],
): Promise<void> {
  const baseDeDatos = await obtenerBaseDeDatosLocal();
  await baseDeDatos.withTransactionAsync(async () => {
    for (const visita of visitasDelServidor) {
      await baseDeDatos.runAsync(
        `INSERT INTO ${NOMBRE_DE_LA_TABLA_DE_VISITAS} (${COLUMNAS_DE_LA_VISITA})
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(id) DO UPDATE SET
           lugar_id = excluded.lugar_id,
           fecha_hora = excluded.fecha_hora,
           origen = excluded.origen,
           nota = excluded.nota,
           sincronizada = 1,
           foto_uri = CASE
             WHEN ${NOMBRE_DE_LA_TABLA_DE_VISITAS}.foto_uri IS NOT NULL
               AND ${NOMBRE_DE_LA_TABLA_DE_VISITAS}.foto_uri NOT LIKE 'http%'
             THEN ${NOMBRE_DE_LA_TABLA_DE_VISITAS}.foto_uri
             ELSE excluded.foto_uri
           END`,
        visita.id,
        visita.usuarioId,
        visita.lugarId,
        visita.fechaHora,
        visita.origen,
        visita.fotoUri,
        visita.nota,
      );
    }
  });
}
