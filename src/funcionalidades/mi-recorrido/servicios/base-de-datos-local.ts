import * as SQLite from "expo-sqlite";
import {
  NOMBRE_DE_LA_BASE_DE_DATOS_LOCAL,
  NOMBRE_DE_LA_TABLA_DE_VISITAS,
} from "../constantes/almacenamiento-local";

let promesaDeLaBaseDeDatos: Promise<SQLite.SQLiteDatabase> | null = null;

async function crearEsquema(baseDeDatos: SQLite.SQLiteDatabase): Promise<void> {
  await baseDeDatos.execAsync(`
    CREATE TABLE IF NOT EXISTS ${NOMBRE_DE_LA_TABLA_DE_VISITAS} (
      id TEXT PRIMARY KEY NOT NULL,
      usuario_id TEXT NOT NULL,
      lugar_id TEXT NOT NULL,
      fecha_hora TEXT NOT NULL,
      origen TEXT NOT NULL,
      foto_uri TEXT,
      nota TEXT,
      sincronizada INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS indice_de_visitas_por_usuario
      ON ${NOMBRE_DE_LA_TABLA_DE_VISITAS} (usuario_id, fecha_hora);
  `);
}

async function abrirYPrepararBaseDeDatos(): Promise<SQLite.SQLiteDatabase> {
  const baseDeDatos = await SQLite.openDatabaseAsync(
    NOMBRE_DE_LA_BASE_DE_DATOS_LOCAL,
  );
  await crearEsquema(baseDeDatos);
  return baseDeDatos;
}

export function obtenerBaseDeDatosLocal(): Promise<SQLite.SQLiteDatabase> {
  if (promesaDeLaBaseDeDatos === null) {
    const promesa = abrirYPrepararBaseDeDatos();
    promesa.catch(() => {
      promesaDeLaBaseDeDatos = null;
    });
    promesaDeLaBaseDeDatos = promesa;
  }
  return promesaDeLaBaseDeDatos;
}
