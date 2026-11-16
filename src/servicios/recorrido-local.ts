
import * as SQLite from "expo-sqlite";

import type { Categoria, Lugar } from "@/tipos/recorrido";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Abre la base de datos y prepara las tablas.
async function obtenerDB() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("recorrido.db");
  }

  const db = await dbPromise;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      icono TEXT NOT NULL,
      color TEXT NOT NULL,
      orden INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lugares (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      categoriaId TEXT NOT NULL,
      latitud REAL,
      longitud REAL
    );

  `);

  return db;
}

// Guarda las categorías recibidas del backend.
export async function guardarCategoriasLocales(
  categorias: Categoria[],
): Promise<void> {
  const db = await obtenerDB();

  await db.withExclusiveTransactionAsync(async () => {
    await db.runAsync("DELETE FROM categorias");

    for (const categoria of categorias) {
      await db.runAsync(
        `INSERT INTO categorias (id, nombre, icono, color, orden)
         VALUES (?, ?, ?, ?, ?)`,
        categoria.id,
        categoria.nombre,
        categoria.icono,
        categoria.color,
        categoria.orden,
      );
    }
  });
}

// Recupera las categorías almacenadas.
export async function obtenerCategoriasLocales(): Promise<Categoria[]> {
  const db = await obtenerDB();

  return db.getAllAsync<Categoria>(
    "SELECT * FROM categorias ORDER BY orden ASC",
  );
}

// Guarda los lugares recibidos del backend.
export async function guardarLugaresLocales(
  lugares: Lugar[],
  reemplazar = true,
  ): Promise<void> {
  const db = await obtenerDB();

  await db.withExclusiveTransactionAsync(async () => {
    if (reemplazar) await db.runAsync("DELETE FROM lugares");

    for (const lugar of lugares) {
      await db.runAsync(
        `INSERT INTO lugares (
          id, nombre, descripcion, categoriaId, latitud, longitud
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          nombre = excluded.nombre,
          descripcion = excluded.descripcion,
          categoriaId = excluded.categoriaId,
          latitud = excluded.latitud,
          longitud = excluded.longitud`,
        lugar.id,
        lugar.nombre,
        lugar.descripcion,
        lugar.categoriaId,
        lugar.coordenadas?.latitud ?? null,
        lugar.coordenadas?.longitud ?? null,
      );
    }
  });
}

// Recupera los lugares, opcionalmente filtrados por categoría.
export async function obtenerLugaresLocales(
  categoriaId?: string,
): Promise<Lugar[]> {
  const db = await obtenerDB();

  const filas = categoriaId
    ? await db.getAllAsync<{
        id: string;
        nombre: string;
        descripcion: string;
        categoriaId: string;
        latitud: number | null;
        longitud: number | null;
      }>(
        "SELECT * FROM lugares WHERE categoriaId = ? ORDER BY nombre ASC",
        categoriaId,
      )
    : await db.getAllAsync<{
        id: string;
        nombre: string;
        descripcion: string;
        categoriaId: string;
        latitud: number | null;
        longitud: number | null;
      }>("SELECT * FROM lugares ORDER BY nombre ASC");

  return filas.map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    categoriaId: fila.categoriaId,
    ...(fila.latitud !== null && fila.longitud !== null
      ? {
          coordenadas: {
            latitud: fila.latitud,
            longitud: fila.longitud,
          },
        }
      : {}),
  }));
}
