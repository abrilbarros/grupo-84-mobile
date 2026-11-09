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
import { useTheme } from "@/hooks/use-theme";
import { CuentaVerificacion } from "@/components/cuenta-verificacion";

export default function PerfilScreen() {
  const colores = useTheme();
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
        <View style={styles.cuenta}>
          <View
            style={[styles.tarjeta, { backgroundColor: colores.secondary }]}
          >
            <Ionicons
              name="person-circle-outline"
              size={40}
              color={colores.primary}
              accessible={false}
            />
            <View style={styles.datosUsuario}>
              <ThemedText
                style={{
                  color: colores.textContent,
                  fontWeight: "700",
                  fontSize: 20,
                  lineHeight: 28,
                }}
              >
                {sesion.usuario.nombre}
              </ThemedText>
              <ThemedText
                style={{ color: colores.textContent, fontWeight: "400" }}
              >
                {sesion.usuario.email}
              </ThemedText>
            </View>
          </View>
          <View
            style={[styles.opciones, { backgroundColor: colores.secondary }]}
          >
            <CuentaBoton
              titulo="Mis favoritos"
              icono="heart-outline"
              secundario
              tamanoIcono={22}
              alineadoIzquierda
              style={styles.filaOpcion}
              onPress={() => router.push("/favoritos")}
            />
            <View
              style={[styles.separador, { backgroundColor: colores.primary }]}
            />
            <CuentaBoton
              titulo={
                biometriaActiva
                  ? "Desactivar ingreso biométrico"
                  : "Activar ingreso biométrico"
              }
              icono="finger-print-outline"
              secundario
              tamanoIcono={22}
              alineadoIzquierda
              style={styles.filaOpcion}
              cargando={activando}
              textoCarga="Verificando…"
              onPress={biometriaActiva ? confirmarDesactivacion : activar}
            />
          </View>
          <CuentaError mensaje={errorBiometria} />
          <View
            style={[styles.opciones, { backgroundColor: colores.secondary }]}
          >
            <CuentaBoton
              titulo="Cerrar sesión"
              cargando={cerrando}
              textoCarga="Cerrando sesión…"
              icono="log-out-outline"
              tamanoTexto={18}
              tamanoIcono={22}
              secundario
              alineadoIzquierda
              style={styles.filaOpcion}
              onPress={confirmarCierre}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.presentacion}>
            <CuentaLogo />
            <ThemedText
              role="heading"
              style={[styles.subtitulo, { color: colores.textContent }]}
            >
              Mi cuenta
            </ThemedText>
            <ThemedText
              style={{ color: colores.textContent, textAlign: "center" }}
            >
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
  cuenta: { gap: Spacing.three },
  datosUsuario: { flex: 1, minWidth: 0, gap: Spacing.one },
  opciones: { borderRadius: 18, padding: Spacing.one },
  filaOpcion: { backgroundColor: "transparent" },
  separador: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.3,
    marginHorizontal: Spacing.three,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 18,
    gap: Spacing.three,
  },
});
