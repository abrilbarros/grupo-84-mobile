import type { RespuestaUno, Sesion } from "@/tipos/api";
import type { Usuario } from "@/tipos/usuario";
import { ErrorApi, ErrorConexion, solicitar } from "./api";

export async function obtenerUsuarioActual(
  token: string,
  signal: AbortSignal,
): Promise<Usuario> {
  const respuesta = await solicitar<RespuestaUno<Usuario>>("/yo", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  const usuario = respuesta?.datos;
  if (!usuario?.id || !usuario.nombre || !usuario.email)
    throw new Error("Respuesta de usuario inválida.");
  return usuario;
}

export type ErroresIngreso = { email?: string; contrasena?: string };

export function validarIngreso(
  email: string,
  contrasena: string,
): ErroresIngreso {
  const errores: ErroresIngreso = {};
  if (!email.trim()) errores.email = "Ingresá tu correo electrónico.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errores.email = "Ingresá un correo electrónico válido.";
  }
  if (!contrasena) errores.contrasena = "Ingresá tu contraseña.";
  return errores;
}

export async function ingresar(
  email: string,
  contrasena: string,
  signal: AbortSignal,
): Promise<Sesion> {
  const respuesta = await solicitar<RespuestaUno<Sesion>>("/auth/ingreso", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), contrasena }),
    signal,
  });
  return sesionDeRespuesta(respuesta);
}

function sesionDeRespuesta(respuesta: RespuestaUno<Sesion>): Sesion {
  const sesion = respuesta?.datos;
  if (
    !sesion?.token ||
    !sesion.usuario?.id ||
    !sesion.usuario.nombre ||
    !sesion.usuario.email
  ) {
    throw new Error("Respuesta de ingreso inválida.");
  }
  return sesion;
}

export function mensajeDeIngreso(error: unknown): string {
  if (error instanceof ErrorConexion) return error.message;
  if (
    error instanceof ErrorApi &&
    error.estado === 401 &&
    error.codigo === "CREDENCIALES_INVALIDAS"
  ) {
    return "El correo o la contraseña son incorrectos.";
  }
  return "Ocurrió un error. Intentá nuevamente.";
}

export type DatosRegistro = {
  nombre: string;
  email: string;
  contrasena: string;
};
export type ErroresRegistro = ErroresIngreso & { nombre?: string };

export function validarRegistro(datos: DatosRegistro): ErroresRegistro {
  const errores: ErroresRegistro = validarIngreso(
    datos.email,
    datos.contrasena,
  );
  if (!datos.nombre.trim()) errores.nombre = "Ingresá tu nombre.";
  else if (Array.from(datos.nombre.trim()).length > 100)
    errores.nombre = "El nombre puede tener hasta 100 caracteres.";
  if (Array.from(datos.email.trim()).length > 254)
    errores.email = "El correo puede tener hasta 254 caracteres.";
  if (datos.contrasena && Array.from(datos.contrasena).length < 8)
    errores.contrasena = "La contraseña tiene que tener al menos 8 caracteres.";
  else if (Array.from(datos.contrasena).length > 200)
    errores.contrasena = "La contraseña puede tener hasta 200 caracteres.";
  return errores;
}

export async function registrar(
  datos: DatosRegistro,
  signal: AbortSignal,
): Promise<Sesion> {
  const respuesta = await solicitar<RespuestaUno<Sesion>>("/auth/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: datos.nombre.trim(),
      email: datos.email.trim(),
      contrasena: datos.contrasena,
    }),
    signal,
  });
  return sesionDeRespuesta(respuesta);
}

export function mensajeDeRegistro(error: unknown): string {
  if (error instanceof ErrorConexion) return error.message;
  if (
    error instanceof ErrorApi &&
    error.estado === 409 &&
    error.codigo === "EMAIL_YA_REGISTRADO"
  ) {
    return "Ya hay una cuenta con ese correo electrónico. Iniciá sesión.";
  }
  if (
    error instanceof ErrorApi &&
    error.estado === 400 &&
    error.codigo === "VALIDACION_FALLIDA"
  ) {
    return "Revisá los datos ingresados e intentá nuevamente.";
  }
  return "Ocurrió un error. Intentá nuevamente.";
}
