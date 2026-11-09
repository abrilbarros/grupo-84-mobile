import { useEffect, useRef, useState } from "react";
import { router, Stack } from "expo-router";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import {
  CuentaBoton,
  CuentaContenedor,
  CuentaError,
} from "@/components/cuenta-ui";
import { CuentaVerificacion } from "@/components/cuenta-verificacion";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useSesion } from "@/contextos/sesion";
import { useTheme } from "@/hooks/use-theme";
import { ErrorApi, ErrorConexion } from "@/servicios/api";
import { listarFavoritos, quitarFavorito } from "@/servicios/favoritos";
import { obtenerLugar } from "@/servicios/lugares";
import type { Meta } from "@/tipos/api";
import type { Favorito } from "@/tipos/favorito";
import type { ResumenLugar } from "@/tipos/lugar";

type FilaFavorito = { favorito: Favorito; lugar: ResumenLugar | null };
type ListaFavoritos = {
  usuarioId: string;
  token: string;
  filas: FilaFavorito[];
  meta: Meta;
};

export default function FavoritosScreen() {
  const colores = useTheme();
  const { sesion, restaurando, errorRestauracion, restaurarSesion } =
    useSesion();
  const usuarioId = sesion?.usuario.id;
  const token = sesion?.token;
  const [datos, setDatos] = useState<ListaFavoritos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [quitando, setQuitando] = useState<string>();
  const [error, setError] = useState<string>();
  const [sesionRechazada, setSesionRechazada] = useState(false);
  const consulta = useRef<AbortController | null>(null);
  const operacionEnCurso = useRef(false);

  function mostrarError(fallo: unknown) {
    if (fallo instanceof ErrorApi && fallo.estado === 401) {
      setDatos(null);
      setSesionRechazada(true);
      setError("La API no pudo validar tu sesión. Verificala para continuar.");
    } else {
      setError(
        fallo instanceof ErrorConexion
          ? fallo.message
          : "No pudimos completar la operación. Intentá nuevamente.",
      );
    }
  }

  async function cargar(pagina: number, control: AbortController) {
    if (
      !token ||
      !usuarioId ||
      control.signal.aborted ||
      operacionEnCurso.current
    )
      return;
    operacionEnCurso.current = true;
    setCargando(true);
    setError(undefined);
    setSesionRechazada(false);
    if (pagina === 1) setDatos(null);
    try {
      const respuesta = await listarFavoritos(token, pagina, control.signal);
      if (control.signal.aborted) return;
      if (
        respuesta.datos.some((favorito) => favorito.usuarioId !== usuarioId)
      ) {
        throw new Error("La respuesta no corresponde al usuario actual.");
      }
      const filas = await Promise.all(
        respuesta.datos.map(async (favorito): Promise<FilaFavorito> => {
          try {
            const lugar = await obtenerLugar(favorito.lugarId, control.signal);
            return { favorito, lugar };
          } catch (fallo) {
            if (control.signal.aborted) throw fallo;
            // Un detalle no disponible no oculta los demás favoritos ni impide quitarlo.
            return { favorito, lugar: null };
          }
        }),
      );
      if (control.signal.aborted) return;
      setDatos((anteriores) => ({
        usuarioId,
        token,
        filas:
          pagina > 1 &&
          anteriores?.usuarioId === usuarioId &&
          anteriores.token === token
            ? [
                ...anteriores.filas,
                ...filas.filter(
                  (fila) =>
                    !anteriores.filas.some(
                      (anterior) => anterior.favorito.id === fila.favorito.id,
                    ),
                ),
              ]
            : filas,
        meta: respuesta.meta,
      }));
    } catch (fallo) {
      if (!control.signal.aborted) mostrarError(fallo);
    } finally {
      if (!control.signal.aborted) {
        setCargando(false);
        operacionEnCurso.current = false;
      }
    }
  }

  useEffect(() => {
    const control = new AbortController();
    consulta.current = control;
    operacionEnCurso.current = false;
    setDatos(null);
    setError(undefined);
    setSesionRechazada(false);
    setQuitando(undefined);
    if (token && usuarioId && !restaurando && !errorRestauracion)
      void cargar(1, control);
    else setCargando(false);
    return () => {
      control.abort();
      if (consulta.current === control) consulta.current = null;
    };
  }, [token, usuarioId, restaurando, errorRestauracion]);

  async function quitar(favorito: Favorito) {
    const control = consulta.current;
    if (
      !token ||
      favorito.usuarioId !== usuarioId ||
      !control ||
      control.signal.aborted ||
      operacionEnCurso.current
    )
      return;
    operacionEnCurso.current = true;
    setQuitando(favorito.id);
    setError(undefined);
    try {
      await quitarFavorito(token, favorito.lugarId, control.signal);
      if (control.signal.aborted) return;
      // La API ya confirmó el borrado. Reiniciamos la paginación para no saltar filas.
      operacionEnCurso.current = false;
      await cargar(1, control);
    } catch (fallo) {
      if (!control.signal.aborted) mostrarError(fallo);
    } finally {
      if (!control.signal.aborted) {
        setQuitando(undefined);
        operacionEnCurso.current = false;
      }
    }
  }

  function recargar() {
    if (consulta.current) void cargar(1, consulta.current);
  }

  // Además de limpiar al cambiar la sesión, nunca renderizamos filas de otra cuenta.
  const actuales =
    datos?.usuarioId === usuarioId && datos?.token === token ? datos : null;
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Mis favoritos",
          headerTransparent: false,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colores.background },
          headerTintColor: colores.textContent,
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              role="button"
              accessibilityLabel="Volver a Perfil"
              onPress={() => router.replace("/(tabs)/perfil")}
              style={({ pressed }) => [
                styles.volver,
                {
                  backgroundColor: pressed ? colores.secondary : "transparent",
                },
              ]}
            >
              <Ionicons
                name="arrow-back-outline"
                size={22}
                color={colores.primary}
                accessible={false}
              />
            </Pressable>
          ),
        }}
      />
      {restaurando || errorRestauracion ? (
        <CuentaVerificacion conEncabezado />
      ) : (
        <CuentaContenedor conEncabezado>
          {!sesion ? (
            <>
              <ThemedText style={{ color: colores.textContent }}>
                Iniciá sesión para consultar tus favoritos.
              </ThemedText>
              <CuentaBoton
                titulo="Iniciar sesión"
                onPress={() => router.push("/login")}
              />
            </>
          ) : (
            <>
              <CuentaError mensaje={error} />
              {sesionRechazada ? (
                <CuentaBoton
                  titulo="Verificar sesión"
                  onPress={() => {
                    void restaurarSesion();
                  }}
                />
              ) : (
                <>
                  {cargando && (
                    <View style={styles.carga}>
                      <ActivityIndicator color={colores.primary} />
                      <ThemedText
                        accessibilityLiveRegion="polite"
                        style={{ color: colores.textContent }}
                      >
                        Cargando favoritos…
                      </ThemedText>
                    </View>
                  )}
                  {actuales?.filas.length === 0 && !cargando && (
                    <ThemedText style={{ color: colores.textContent }}>
                      Todavía no tenés lugares favoritos.
                    </ThemedText>
                  )}
                  {actuales?.filas.map(({ favorito, lugar }) => (
                    <View
                      key={favorito.id}
                      style={[styles.fila, { borderColor: colores.primary }]}
                    >
                      {lugar?.imagenes[0] ? (
                        <Image
                          source={{ uri: lugar.imagenes[0] }}
                          contentFit="cover"
                          style={styles.imagen}
                          accessibilityLabel={`Imagen de ${lugar.nombre}`}
                        />
                      ) : (
                        <View
                          style={[
                            styles.sinImagen,
                            { backgroundColor: colores.secondary },
                          ]}
                        >
                          <ThemedText style={{ color: colores.textContent }}>
                            Sin imagen
                          </ThemedText>
                        </View>
                      )}
                      <ThemedText
                        style={[styles.nombre, { color: colores.textContent }]}
                      >
                        {lugar?.nombre ?? "Lugar no disponible"}
                      </ThemedText>
                      <ThemedText style={{ color: colores.textContent }}>
                        {lugar?.descripcionCorta ??
                          "No pudimos cargar la información de este lugar. Podés reintentar o quitarlo de tus favoritos."}
                      </ThemedText>
                      <CuentaBoton
                        titulo="Quitar de favoritos"
                        icono="heart-dislike-outline"
                        secundario
                        tamanoTexto={14}
                        tamanoIcono={22}
                        alineadoIzquierda
                        style={styles.quitar}
                        cargando={quitando === favorito.id}
                        textoCarga="Quitando…"
                        onPress={() => {
                          void quitar(favorito);
                        }}
                      />
                    </View>
                  ))}
                  {!cargando &&
                    (error || actuales?.filas.some((fila) => !fila.lugar)) && (
                      <CuentaBoton
                        titulo="Reintentar"
                        secundario
                        onPress={recargar}
                      />
                    )}
                  {!error &&
                    actuales &&
                    actuales.meta.pagina * actuales.meta.porPagina <
                      actuales.meta.total && (
                      <CuentaBoton
                        titulo="Cargar más"
                        cargando={cargando}
                        textoCarga="Cargando…"
                        onPress={() => {
                          if (consulta.current)
                            void cargar(
                              actuales.meta.pagina + 1,
                              consulta.current,
                            );
                        }}
                      />
                    )}
                </>
              )}
            </>
          )}
        </CuentaContenedor>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  volver: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  quitar: { alignSelf: "flex-start", padding: Spacing.two },
  carga: { alignItems: "center", gap: Spacing.two },
  fila: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  nombre: { fontSize: 20, lineHeight: 28, fontWeight: "600" },
  imagen: { width: "100%", aspectRatio: 2.2, borderRadius: 8 },
  sinImagen: {
    minHeight: 80,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
