import type { Visita } from "@/tipos/visita";
import { solicitar } from "./api";
import { File } from "expo-file-system";
import type { DatosParaRegistrarVisita, Lugar } from "@/tipos/recorrido";

import { ErrorConexion } from "./api";

import {
  guardarCategoriasLocales,
  obtenerCategoriasLocales,
  guardarLugaresLocales,
  obtenerLugaresLocales,
} from "./recorrido-local";

export async function registrarVisita(
  token: string,
  datosDeLaVisita: DatosParaRegistrarVisita,
): Promise<Visita> {
  const respuesta = await solicitar<{
    datos: Visita;
    meta: null;
  }>("/yo/visitas", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: datosDeLaVisita.id,
      lugarId: datosDeLaVisita.lugarId,
      origen: datosDeLaVisita.origen,
      fechaHora: datosDeLaVisita.fechaHora,
      nota: datosDeLaVisita.nota,
      fotoUri: null,
    }),
  });

  return respuesta.datos;
}

export async function subirFotografia(
  token: string,
  fotoUri: string,
): Promise<string> {
  const formulario = new FormData();

  const archivo = new File(fotoUri);

  formulario.append("archivo", archivo);

  const respuesta = await solicitar<{
    datos: {
      url: string;
    };
    meta: null;
  }>("/archivos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formulario,
  });

  return respuesta.datos.url;
}

export async function actualizarFotoVisita(
  token: string,
  visitaId: string,
  fotoUri: string,
): Promise<void> {
  await solicitar(`/yo/visitas/${visitaId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fotoUri,
    }),
  });
}

export async function obtenerCategorias() {
  try {
    const respuesta = await solicitar<any>("/categorias");
    const categorias = respuesta.datos || respuesta;

    await guardarCategoriasLocales(categorias);

    return categorias;
  } catch (error) {
    if (error instanceof ErrorConexion) {
      const categoriasLocales = await obtenerCategoriasLocales();

      if (categoriasLocales.length > 0) {
        return categoriasLocales;
      }
    }

    throw error;
  }
}

export async function obtenerLugares(categoriaId?: string) {
  try {
    const parametros = new URLSearchParams({
      porPagina: "500",
    });

    if (categoriaId) {
      parametros.append("categoriaId", categoriaId);
    }

    const respuesta = await solicitar<any>(`/lugares?${parametros.toString()}`);

    const lugares = respuesta.datos || respuesta;
    await guardarLugaresLocales(lugares, !categoriaId);

    return lugares;
  } catch (error) {
    if (error instanceof ErrorConexion) {
      return await obtenerLugaresLocales(categoriaId);
    }

    throw error;
  }
}

export async function obtenerLugarPorQr(codigo: string): Promise<Lugar> {
  const respuesta = await solicitar<{
    datos: Lugar;
    meta: null;
  }>(`/lugares/qr/${encodeURIComponent(codigo)}`);

  return respuesta.datos;
}

export async function obtenerLugaresCercanos(
  latitud: number,
  longitud: number,
  radioMetros: number,
): Promise<Lugar[]> {
  const parametros = new URLSearchParams({
    latitud: String(latitud),
    longitud: String(longitud),
    radioMetros: String(radioMetros),
    orden: "distancia",
  });

  const respuesta = await solicitar<{
    datos: Lugar[];
    meta: null;
  }>(`/lugares?${parametros.toString()}`);

  return respuesta.datos;
}

export async function obtenerMisVisitas(token: string): Promise<Visita[]> {
  const parametros = new URLSearchParams({
    porPagina: "500",
  });

  const respuesta = await solicitar<{
    datos: Visita[];
    meta: {
      total: number;
      pagina: number;
      porPagina: number;
    };
  }>(`/yo/visitas?${parametros.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return respuesta.datos;
}
