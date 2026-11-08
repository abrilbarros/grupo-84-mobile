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
import * as SecureStore from "expo-secure-store";
import type { Sesion } from "@/tipos/api";
import { obtenerUsuarioActual } from "@/servicios/cuenta";
import { ErrorApi, ErrorConexion } from "@/servicios/api";

const CLAVE_TOKEN = "mi-ciudad.token";
const ES_WEB = Platform.OS === "web";

export class ErrorSesionSegura extends Error {}

type ContextoSesion = {
  sesion: Sesion | null;
  restaurando: boolean;
  errorRestauracion: string | null;
  restaurarSesion: () => Promise<void>;
  iniciarSesion: (sesion: Sesion) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};
const SesionContext = createContext<ContextoSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  // Sólo el token se persiste. El usuario se recupera de /yo; nunca guardamos contraseñas.
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [restaurando, setRestaurando] = useState(true);
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

  const restaurarSesion = useCallback(async () => {
    const actual = ++version.current;
    consulta.current?.abort();
    const control = new AbortController();
    consulta.current = control;
    setRestaurando(true);
    setErrorRestauracion(null);
    setSesion(null);
    try {
      // SecureStore no ofrece persistencia web. Allí se mantiene la sesión sólo en memoria.
      const token = await enAlmacen(() =>
        ES_WEB ? Promise.resolve(null) : SecureStore.getItemAsync(CLAVE_TOKEN),
      );
      if (actual !== version.current || !token) return;
      const usuario = await obtenerUsuarioActual(token, control.signal);
      if (actual === version.current) setSesion({ token, usuario });
    } catch (error) {
      if (actual !== version.current) return;
      if (error instanceof ErrorApi && error.estado === 401) {
        try {
          await enAlmacen(() => SecureStore.deleteItemAsync(CLAVE_TOKEN));
        } catch {
          if (actual === version.current)
            setErrorRestauracion(
              "No pudimos eliminar la sesión vencida. Intentá nuevamente.",
            );
        }
      } else {
        // Un fallo de red, del servidor o de lectura no demuestra que el token sea inválido.
        setErrorRestauracion(
          error instanceof ErrorConexion
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

  async function iniciarSesion(nuevaSesion: Sesion) {
    const actual = ++version.current;
    consulta.current?.abort();
    try {
      if (!ES_WEB)
        await enAlmacen(() =>
          SecureStore.setItemAsync(CLAVE_TOKEN, nuevaSesion.token),
        );
      if (actual !== version.current) return;
      setSesion(nuevaSesion);
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
        await enAlmacen(() => SecureStore.deleteItemAsync(CLAVE_TOKEN));
      if (actual !== version.current) return;
      setSesion(null);
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
