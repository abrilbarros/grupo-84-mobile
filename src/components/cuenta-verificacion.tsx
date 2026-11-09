import { useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Alert } from "react-native";
import {
  CuentaBoton,
  CuentaContenedor,
  CuentaError,
} from "@/components/cuenta-ui";
import { ThemedText } from "@/components/themed-text";
import { useSesion } from "@/contextos/sesion";
import { useAccountTheme } from "@/hooks/use-theme";

// Sólo bloquea Cuenta mientras se valida el token; las pestañas públicas siguen disponibles.
export function CuentaVerificacion({
  conEncabezado = false,
}: {
  conEncabezado?: boolean;
}) {
  const { restaurando, errorRestauracion, restaurarSesion, cerrarSesion } =
    useSesion();
  const colores = useAccountTheme();
  const [cerrando, setCerrando] = useState(false);
  async function salir(conContrasena = false) {
    setCerrando(true);
    try {
      await cerrarSesion();
      if (conContrasena) router.replace("/login");
    } catch {
      /* El contexto muestra el error y permite reintentar. */
    } finally {
      setCerrando(false);
    }
  }
  return (
    <CuentaContenedor conEncabezado={conEncabezado}>
      {restaurando ? (
        <>
          <ActivityIndicator color={colores.primary} />
          <ThemedText
            accessibilityLiveRegion="polite"
            style={{ color: colores.text }}
          >
            Verificando sesión…
          </ThemedText>
        </>
      ) : (
        <>
          <CuentaError mensaje={errorRestauracion ?? undefined} />
          <CuentaBoton
            titulo="Reintentar"
            onPress={() => {
              void restaurarSesion();
            }}
          />
          <CuentaBoton
            titulo="Ingresar con contraseña"
            secundario
            cargando={cerrando}
            textoCarga="Cerrando sesión…"
            onPress={() => {
              void salir(true);
            }}
          />
          <CuentaBoton
            titulo="Cerrar sesión"
            secundario
            cargando={cerrando}
            textoCarga="Cerrando sesión…"
            onPress={() =>
              Alert.alert(
                "Cerrar sesión",
                "¿Seguro que querés cerrar sesión?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Cerrar sesión", onPress: () => salir() },
                ],
              )
            }
          />
        </>
      )}
    </CuentaContenedor>
  );
}
