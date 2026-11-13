import { useRef, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Spacing } from "@/constants/theme";
import {
  CuentaBoton,
  CuentaContenedor,
  CuentaError,
} from "@/components/cuenta-ui";
import { ThemedText } from "@/components/themed-text";
import { useSesion } from "@/contextos/sesion";
import { useTheme } from "@/hooks/use-theme";

// Sólo bloquea Cuenta mientras se valida el token; las pestañas públicas siguen disponibles.
export function CuentaVerificacion({
  conEncabezado = false,
}: {
  conEncabezado?: boolean;
}) {
  const { restaurando, errorRestauracion, restaurarSesion, cerrarSesion } =
    useSesion();
  const colores = useTheme();
  const [accionPendiente, setAccionPendiente] = useState<
    "contrasena" | null
  >(null);
  const cierreEnCurso = useRef(false);
  async function salir() {
    if (cierreEnCurso.current) return;
    cierreEnCurso.current = true;
    setAccionPendiente("contrasena");
    try {
      await cerrarSesion();
      router.replace("/login");
    } catch {
      /* El contexto muestra el error y permite reintentar. */
    } finally {
      cierreEnCurso.current = false;
      setAccionPendiente(null);
    }
  }
  return (
    <CuentaContenedor conEncabezado={conEncabezado}>
      {restaurando ? (
        <View style={styles.grupo}>
          <ActivityIndicator color={colores.primary} />
          <ThemedText
            accessibilityLiveRegion="polite"
            style={{ color: colores.textContent }}
          >
            Verificando sesión…
          </ThemedText>
        </View>
      ) : (
        <View style={styles.grupo}>
          <CuentaError mensaje={errorRestauracion ?? undefined} />
          <CuentaBoton
            titulo="Reintentar"
            icono="finger-print-outline"
            tamanoIcono={22}
            deshabilitado={accionPendiente !== null}
            onPress={() => {
              if (!cierreEnCurso.current) void restaurarSesion();
            }}
          />
          <CuentaBoton
            titulo="Ingresar con contraseña"
            icono="lock-closed-outline"
            tamanoIcono={22}
            secundario
            cargando={accionPendiente === "contrasena"}
            deshabilitado={accionPendiente !== null}
            textoCarga="Cerrando sesión…"
            onPress={() => {
              void salir();
            }}
          />
        </View>
      )}
    </CuentaContenedor>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: Spacing.two },
});
