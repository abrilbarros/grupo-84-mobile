import { ErrorApi, ErrorConexion } from "@/servicios/api";
import { obtenerUsuarioActual } from "@/servicios/cuenta";
import type { Sesion } from "@/tipos/api";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

const CLAVE_TOKEN = "mi-ciudad.token";
const CLAVE_BIOMETRIA = "mi-ciudad.biometria";
const CLAVE_USUARIO_SESION = "mi-ciudad.usuario-sesion";
const ES_WEB = Platform.OS === "web";

export class ErrorSesionSegura extends Error {}

function cuentasConBiometria(valor: string | null): string[] {
  // El antiguo "true" no identifica una cuenta. Sólo se migra al restaurarla.
  if (valor === null || valor === "true") return [];
  const cuentas: unknown = JSON.parse(valor);
  if (!Array.isArray(cuentas) || !cuentas.every((id) => typeof id === "string"))
    throw new ErrorSesionSegura("No pudimos leer la preferencia biométrica.");
  return cuentas;
}

type ContextoSesion = {
  sesion: Sesion | null;
  restaurando: boolean;
  errorRestauracion: string | null;
  biometriaActiva: boolean;
  activarBiometria: () => Promise<void>;
  desactivarBiometria: () => Promise<void>;
  restaurarSesion: () => Promise<void>;
  iniciarSesion: (sesion: Sesion) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};
const SesionContext = createContext<ContextoSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  // Persistimos token, identificador y preferencias. El usuario se recupera de /yo.
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [restaurando, setRestaurando] = useState(true);
  const [biometriaActiva, setBiometriaActiva] = useState(false);
  const biometriaVerificada = useRef(false);
  const biometriaEnCurso = useRef(false);
  const [errorRestauracion, setErrorRestauracion] = useState<string | null>(
    null,
  );
  const version = useRef(0);
  const consulta = useRef<AbortController | null>(null);
  const almacenamiento = useRef<Promise<void>>(Promise.resolve());

  // Ordena lecturas/escrituras: un borrado anterior no puede borrar un login posterior.
  const enAlmacen = useCallback(
    <T,>(operacion: () => Promise<T>): Promise<T> => {
      const resultado = almacenamiento.current.then(operacion);
      almacenamiento.current = resultado.then(
        () => undefined,
        () => undefined,
      );
      return resultado;
    },
    [],
  );

  async function verificarBiometria() {
    if (biometriaEnCurso.current) {
      throw new ErrorSesionSegura(
        "Ya hay una verificación biométrica en curso.",
      );
    }
    biometriaEnCurso.current = true;
    try {
      if (
        ES_WEB ||
        !(await LocalAuthentication.hasHardwareAsync()) ||
        !(await LocalAuthentication.isEnrolledAsync())
      ) {
        throw new ErrorSesionSegura(
          "No hay biometría disponible o configurada. Ingresá con correo y contraseña.",
        );
      }
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirmá tu identidad",
        cancelLabel: "Cancelar",
        disableDeviceFallback: true,
        biometricsSecurityLevel: "strong",
      });
      if (!resultado.success) {
        throw new ErrorSesionSegura(
          "No se completó la verificación biométrica. Reintentá o ingresá con correo y contraseña.",
        );
      }
    } finally {
      biometriaEnCurso.current = false;
    }
  }

  const restaurarSesion = useCallback(async () => {
    const actual = ++version.current;
    consulta.current?.abort();
    const control = new AbortController();
    consulta.current = control;
    setRestaurando(true);
    setErrorRestauracion(null);
    setSesion(null);
    try {
      // SecureStore no ofrece persistencia web. Allá se mantiene la sesión sólo en memoria.
      const token = await enAlmacen(() =>
        ES_WEB ? Promise.resolve(null) : SecureStore.getItemAsync(CLAVE_TOKEN),
      );
      if (actual !== version.current || !token) return;
      const { preferencia, usuarioId } = await enAlmacen(async () => ({
        preferencia: await SecureStore.getItemAsync(CLAVE_BIOMETRIA),
        usuarioId: await SecureStore.getItemAsync(CLAVE_USUARIO_SESION),
      }));
      if (actual !== version.current) return;
      const cuentas = cuentasConBiometria(preferencia);
      if (!usuarioId && cuentas.length) {
        throw new ErrorSesionSegura(
          "Volvé a ingresar con correo y contraseña.",
        );
      }
      const activa =
        preferencia === "true" || cuentas.includes(usuarioId ?? "");
      setBiometriaActiva(activa);
      if (activa && !biometriaVerificada.current) {
        await verificarBiometria();
        if (actual !== version.current) return;
        biometriaVerificada.current = true;
      }
      const usuario = await obtenerUsuarioActual(token, control.signal);
      if (actual !== version.current) return;
      if (usuarioId && usuario.id !== usuarioId)
        throw new ErrorApi(401, "NO_AUTENTICADO");
      // La preferencia antigua sólo se atribuye después de biometría y /yo válidos.
      await enAlmacen(async () => {
        if (actual !== version.current) return;
        if (preferencia === "true") {
          await SecureStore.setItemAsync(
            CLAVE_BIOMETRIA,
            JSON.stringify([usuario.id]),
          );
        }
        await SecureStore.setItemAsync(CLAVE_USUARIO_SESION, usuario.id);
      });
      if (actual === version.current) setSesion({ token, usuario });
    } catch (error) {
      if (actual !== version.current) return;
      if (error instanceof ErrorApi && error.estado === 401) {
        try {
          await enAlmacen(async () => {
            await SecureStore.deleteItemAsync(CLAVE_TOKEN);
            await SecureStore.deleteItemAsync(CLAVE_USUARIO_SESION);
          });
          if (actual === version.current) {
            setBiometriaActiva(false);
            biometriaVerificada.current = false;
          }
        } catch {
          if (actual === version.current)
            setErrorRestauracion(
              "No pudimos eliminar la sesión vencida. Intentá nuevamente.",
            );
        }
      } else {
        // Un fallo de red, del servidor o de lectura no demuestra que el token sea inválido.
        setErrorRestauracion(
          error instanceof ErrorSesionSegura
            ? error.message
            : error instanceof ErrorConexion
              ? "No pudimos verificar tu sesión. Revisá la conexión e intentá nuevamente."
              : "No pudimos recuperar tu sesión. Intentá nuevamente.",
        );
      }
    } finally {
      if (actual === version.current) setRestaurando(false);
    }
  }, [enAlmacen]);

  useEffect(() => {
    void restaurarSesion();
    return () => {
      ++version.current;
      consulta.current?.abort();
    };
  }, [restaurarSesion]);

  async function activarBiometria() {
    if (!sesion) return;
    const actual = version.current;
    try {
      await verificarBiometria();
      if (actual !== version.current) return;
      await enAlmacen(async () => {
        const cuentas = cuentasConBiometria(
          await SecureStore.getItemAsync(CLAVE_BIOMETRIA),
        );
        if (actual !== version.current) return;
        if (!cuentas.includes(sesion.usuario.id)) {
          await SecureStore.setItemAsync(
            CLAVE_BIOMETRIA,
            JSON.stringify([...cuentas, sesion.usuario.id]),
          );
        }
      });
      if (actual !== version.current) return;
      setBiometriaActiva(true);
      biometriaVerificada.current = true;
    } catch (error) {
      if (actual !== version.current) return;
      throw new ErrorSesionSegura(
        error instanceof ErrorSesionSegura
          ? error.message
          : "No pudimos activar la biometría. Podés seguir usando correo y contraseña.",
      );
    }
  }

  async function desactivarBiometria() {
    if (!sesion) return;
    const actual = version.current;
    try {
      await enAlmacen(async () => {
        const cuentas = cuentasConBiometria(
          await SecureStore.getItemAsync(CLAVE_BIOMETRIA),
        );
        if (actual !== version.current) return;
        const restantes = cuentas.filter((id) => id !== sesion.usuario.id);
        if (restantes.length) {
          await SecureStore.setItemAsync(
            CLAVE_BIOMETRIA,
            JSON.stringify(restantes),
          );
        } else {
          await SecureStore.deleteItemAsync(CLAVE_BIOMETRIA);
        }
      });
      if (actual !== version.current) return;
      setBiometriaActiva(false);
      biometriaVerificada.current = false;
    } catch {
      if (actual !== version.current) return;
      throw new ErrorSesionSegura(
        "No pudimos desactivar la biometría. Intentá nuevamente.",
      );
    }
  }

  async function iniciarSesion(nuevaSesion: Sesion) {
    const actual = ++version.current;
    consulta.current?.abort();
    try {
      const activa = ES_WEB
        ? false
        : await enAlmacen(async () => {
            const preferencia = await SecureStore.getItemAsync(CLAVE_BIOMETRIA);
            const cuentas = cuentasConBiometria(preferencia);
            // Sin sesión anterior verificada no se puede atribuir el antiguo "true".
            if (preferencia === "true")
              await SecureStore.deleteItemAsync(CLAVE_BIOMETRIA);
            await SecureStore.deleteItemAsync(CLAVE_TOKEN);
            await SecureStore.setItemAsync(
              CLAVE_USUARIO_SESION,
              nuevaSesion.usuario.id,
            );
            await SecureStore.setItemAsync(CLAVE_TOKEN, nuevaSesion.token);
            return cuentas.includes(nuevaSesion.usuario.id);
          });
      if (actual !== version.current) return;
      setSesion(nuevaSesion);
      setBiometriaActiva(activa);
      // Termina de autenticarse con contraseña: no se solicita una huella adicional.
      biometriaVerificada.current = activa;
      setErrorRestauracion(null);
    } catch {
      throw new ErrorSesionSegura(
        "No pudimos guardar tu sesión de forma segura. Intentá nuevamente.",
      );
    } finally {
      if (actual === version.current) setRestaurando(false);
    }
  }

  async function cerrarSesion() {
    // Invalida incluso una restauración cuya respuesta ya esté en camino.
    const actual = ++version.current;
    consulta.current?.abort();
    try {
      if (!ES_WEB)
        await enAlmacen(async () => {
          await SecureStore.deleteItemAsync(CLAVE_TOKEN);
          await SecureStore.deleteItemAsync(CLAVE_USUARIO_SESION);
        });
      if (actual !== version.current) return;
      setSesion(null);
      setBiometriaActiva(false);
      biometriaVerificada.current = false;
      setErrorRestauracion(null);
    } catch {
      const mensaje =
        "No pudimos eliminar la sesión guardada. Intentá nuevamente.";
      if (actual === version.current) setErrorRestauracion(mensaje);
      throw new ErrorSesionSegura(mensaje);
    } finally {
      if (actual === version.current) setRestaurando(false);
    }
  }
  return (
    <SesionContext
      value={{
        sesion,
        restaurando,
        errorRestauracion,
        biometriaActiva,
        activarBiometria,
        desactivarBiometria,
        restaurarSesion,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </SesionContext>
  );
}

export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error("useSesion requiere SesionProvider.");
  return contexto;
}
