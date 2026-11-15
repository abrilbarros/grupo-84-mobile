
import * as SQLite from "expo-sqlite";

import type { Categoria, Lugar } from "@/tipos/recorrido";
import type { Visita } from "@/tipos/visita";

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

    CREATE TABLE IF NOT EXISTS visitas (
      id TEXT PRIMARY KEY NOT NULL,
      usuarioId TEXT NOT NULL,
      lugarId TEXT NOT NULL,
      fechaHora TEXT NOT NULL,
      origen TEXT NOT NULL,
      fotoUri TEXT,
      nota TEXT,
      sincronizada INTEGER NOT NULL
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
  ): Promise<void> {
  const db = await obtenerDB();

  await db.withExclusiveTransactionAsync(async () => {
    await db.runAsync("DELETE FROM lugares");

    for (const lugar of lugares) {
      await db.runAsync(
        `INSERT INTO lugares (
          id, nombre, descripcion, categoriaId, latitud, longitud
        ) VALUES (?, ?, ?, ?, ?, ?)`,
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

// Guarda una visita local pendiente de sincronización.
export async function guardarVisitaLocal(
  visita: Visita,
): Promise<void> {
  const db = await obtenerDB();

  await db.runAsync(
    `INSERT INTO visitas (
      id,
      usuarioId,
      lugarId,
      fechaHora,
      origen,
      fotoUri,
      nota,
      sincronizada
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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

// Recupera las visitas que todavía no se sincronizaron.
export async function obtenerVisitasPendientes(): Promise<Visita[]> {
  const db = await obtenerDB();

  const filas = await db.getAllAsync<
    Omit<Visita, "sincronizada"> & { sincronizada: number }
  >(
    "SELECT * FROM visitas WHERE sincronizada = 0 ORDER BY fechaHora ASC",
  );

  return filas.map((visita) => ({
    ...visita,
    sincronizada: Boolean(visita.sincronizada),
  }));
}

// Marca una visita como sincronizada.
export async function marcarVisitaSincronizada(
  id: string,
): Promise<void> {
  const db = await obtenerDB();

  await db.runAsync(
    "UPDATE visitas SET sincronizada = 1 WHERE id = ?",
    id,
  );
}