import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import {
  CuentaBoton,
  CuentaContenedor,
  CuentaError,
  CuentaLogo,
} from "@/components/cuenta-ui";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { ErrorSesionSegura, useSesion } from "@/contextos/sesion";
import { useAccountTheme } from "@/hooks/use-theme";
import { CuentaVerificacion } from "@/components/cuenta-verificacion";

export default function PerfilScreen() {
  const colores = useAccountTheme();
  const {
    sesion,
    cerrarSesion,
    restaurando,
    errorRestauracion,
    biometriaActiva,
    activarBiometria,
    desactivarBiometria,
  } = useSesion();
  const [cerrando, setCerrando] = useState(false);
  const [activando, setActivando] = useState(false);
  const [errorBiometria, setErrorBiometria] = useState<string>();
  async function activar() {
    setActivando(true);
    setErrorBiometria(undefined);
    try {
      if (biometriaActiva) await desactivarBiometria();
      else await activarBiometria();
    } catch (error) {
      setErrorBiometria(
        error instanceof ErrorSesionSegura
          ? error.message
          : "No pudimos activar la biometría. Intentá nuevamente.",
      );
    } finally {
      setActivando(false);
    }
  }
  async function salir() {
    setCerrando(true);
    try {
      await cerrarSesion();
    } catch {
      // El contexto mantiene la sesión y muestra el error de borrado.
    } finally {
      setCerrando(false);
    }
  }
  function confirmarCierre() {
    Alert.alert("Cerrar sesión", "¿Seguro que querés cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", onPress: salir },
    ]);
  }
  function confirmarDesactivacion() {
    Alert.alert(
      "¿Desactivar la protección biométrica?",
      "Si desactivás esta opción, podrás volver a abrir la aplicación sin verificar tu huella mientras tengas una sesión guardada. Tu sesión actual seguirá iniciada",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Desactivar", onPress: activar },
      ],
    );
  }
  if (restaurando || errorRestauracion)
    return <CuentaVerificacion conEncabezado />;
  return (
    <CuentaContenedor conEncabezado>
      {sesion ? (
        <>
          <View
            style={[styles.tarjeta, { backgroundColor: colores.secondary }]}
          >
            <View style={styles.nombre}>
              <Ionicons
                name="person-circle-outline"
                size={26}
                color={colores.primary}
                accessible={false}
              />
              <ThemedText
                style={{
                  color: colores.text,
                  fontWeight: "700",
                  fontSize: 20,
                  lineHeight: 28,
                  flex: 1,
                }}
              >
                {sesion.usuario.nombre}
              </ThemedText>
            </View>
            <ThemedText style={{ color: colores.text, fontWeight: "400" }}>
              {sesion.usuario.email}
            </ThemedText>
          </View>
          <CuentaBoton
            titulo={
              biometriaActiva
                ? "Desactivar ingreso biométrico"
                : "Activar ingreso biométrico"
            }
            icono="finger-print-outline"
            secundario
            cargando={activando}
            textoCarga="Verificando…"
            onPress={biometriaActiva ? confirmarDesactivacion : activar}
          />
          <CuentaError mensaje={errorBiometria} />
          <CuentaBoton
            titulo="Cerrar sesión"
            cargando={cerrando}
            textoCarga="Cerrando sesión…"
            icono="log-out-outline"
            tamanoTexto={18}
            tamanoIcono={22}
            secundario
            onPress={confirmarCierre}
          />
        </>
      ) : (
        <>
          <View style={styles.presentacion}>
            <CuentaLogo />
            <ThemedText
              role="heading"
              style={[styles.subtitulo, { color: colores.text }]}
            >
              Mi cuenta
            </ThemedText>
            <ThemedText style={{ color: colores.text, textAlign: "center" }}>
              Explorá Colón sin iniciar sesión. Creá una cuenta para guardar tus
              favoritos y conservar tu recorrido.
            </ThemedText>
          </View>
          <CuentaBoton
            titulo="Iniciar sesión"
            onPress={() => router.push("/login")}
          />
          <CuentaBoton
            titulo="Crear una cuenta"
            secundario
            conBorde
            onPress={() => router.push("/registro")}
          />
        </>
      )}
    </CuentaContenedor>
  );
}

const styles = StyleSheet.create({
  subtitulo: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "600",
    textAlign: "center",
  },
  presentacion: {
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.three,
  },
  nombre: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  tarjeta: {
    padding: Spacing.four,
    borderRadius: 18,
    gap: Spacing.three,
  },
});
