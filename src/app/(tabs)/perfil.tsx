import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import {
  CuentaBoton,
  CuentaContenedor,
  CuentaLogo,
} from "@/components/cuenta-ui";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useSesion } from "@/contextos/sesion";
import { useAccountTheme } from "@/hooks/use-theme";
import { CuentaVerificacion } from "@/components/cuenta-verificacion";

export default function PerfilScreen() {
  const colores = useAccountTheme();
  const { sesion, cerrarSesion, restaurando, errorRestauracion } = useSesion();
  const [cerrando, setCerrando] = useState(false);
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
