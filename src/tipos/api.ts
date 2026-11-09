import type { Usuario } from "./usuario";

export interface RespuestaUno<T> {
  datos: T;
  meta: null;
}

export interface RespuestaError {
  error: { codigo: string; mensaje: string };
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}
