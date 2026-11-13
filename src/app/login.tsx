import { useEffect, useRef, useState } from "react";
import { Redirect, router } from "expo-router";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
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
import { CuentaVerificacion } from "@/components/cuenta-verificacion";
import { useTheme } from "@/hooks/use-theme";
import {
  ingresar,
  mensajeDeIngreso,
  validarIngreso,
  type ErroresIngreso,
} from "@/servicios/cuenta";

export default function LoginScreen() {
  const colores = useTheme();
  const { sesion, iniciarSesion, restaurando, errorRestauracion } = useSesion();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errores, setErrores] = useState<ErroresIngreso>({});
  const [error, setError] = useState<string>();
  const [cargando, setCargando] = useState(false);
  const solicitud = useRef<AbortController | null>(null);
  const campoContrasena = useRef<TextInput>(null);
  useEffect(() => () => solicitud.current?.abort(), []);

  async function enviar() {
    if (solicitud.current) return;
    const validacion = validarIngreso(email, contrasena);
    setErrores(validacion);
    setError(undefined);
    if (Object.keys(validacion).length) return;
    setMostrarContrasena(false);
    Keyboard.dismiss();
    const control = new AbortController();
    solicitud.current = control;
    setCargando(true);
    try {
      const nuevaSesion = await ingresar(email, contrasena, control.signal);
      if (control.signal.aborted) return;
      await iniciarSesion(nuevaSesion);
      if (control.signal.aborted) return;
      setContrasena("");
      router.replace("/(tabs)/perfil");
    } catch (fallo) {
      if (!control.signal.aborted)
        setError(
          fallo instanceof ErrorSesionSegura
            ? fallo.message
            : mensajeDeIngreso(fallo),
        );
    } finally {
      solicitud.current = null;
      if (!control.signal.aborted) setCargando(false);
    }
  }

  if (restaurando || errorRestauracion) return <CuentaVerificacion />;
  if (sesion) return <Redirect href="/(tabs)/perfil" />;
  const campo = [
    styles.campo,
    {
      color: colores.textContent,
      backgroundColor: colores.background,
      borderColor: colores.primary,
    },
  ];
  return (
    <CuentaContenedor>
      <CuentaLogo />
      <ThemedText
        role="heading"
        style={[styles.subtitulo, { color: colores.textContent }]}
      >
        Iniciar sesión
      </ThemedText>
      <View style={styles.grupo}>
        <ThemedText nativeID="email-label" style={{ color: colores.textContent }}>
          Correo electrónico
        </ThemedText>
        <TextInput
          style={campo}
          placeholder="Ingresá tu correo"
          placeholderTextColor={colores.primary}
          value={email}
          onChangeText={(valor) => {
            setEmail(valor);
            setErrores((previos) => ({ ...previos, email: undefined }));
            setError(undefined);
          }}
          editable={!cargando}
          accessibilityLabel="Correo electrónico"
          accessibilityLabelledBy="email-label"
          aria-invalid={!!errores.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => campoContrasena.current?.focus()}
          submitBehavior="submit"
        />
        <CuentaError mensaje={errores.email} />
      </View>
      <View style={styles.grupo}>
        <ThemedText nativeID="contrasena-label" style={{ color: colores.textContent }}>
          Contraseña
        </ThemedText>
        <View
          style={[
            styles.contrasena,
            {
              backgroundColor: colores.background,
              borderColor: colores.primary,
            },
          ]}
        >
          <TextInput
            ref={campoContrasena}
            placeholder="Ingresá tu contraseña"
            placeholderTextColor={colores.primary}
            style={[
              styles.campo,
              styles.entradaContrasena,
              { color: colores.textContent },
            ]}
            value={contrasena}
            onChangeText={(valor) => {
              setContrasena(valor);
              setErrores((previos) => ({ ...previos, contrasena: undefined }));
              setError(undefined);
            }}
            editable={!cargando}
            accessibilityLabel="Contraseña"
            accessibilityLabelledBy="contrasena-label"
            aria-invalid={!!errores.contrasena}
            secureTextEntry={!mostrarContrasena}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={enviar}
          />
          <Pressable
            role="button"
            accessibilityLabel={
              mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            accessibilityState={{ disabled: cargando }}
            disabled={cargando}
            onPress={() => setMostrarContrasena((visible) => !visible)}
            style={styles.ojo}
          >
            <Ionicons
              name={mostrarContrasena ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colores.primary}
              accessible={false}
            />
          </Pressable>
        </View>
        <CuentaError mensaje={errores.contrasena} />
      </View>
      <CuentaError mensaje={error} />
      <CuentaBoton titulo="Ingresar" onPress={enviar} cargando={cargando} />
      <CuentaBoton
        titulo="Crear una cuenta"
        secundario
        onPress={() => router.push("/registro")}
      />
      <CuentaBoton
        titulo="Volver a Perfil"
        secundario
        onPress={() => router.replace("/(tabs)/perfil")}
      />
    </CuentaContenedor>
  );
}

const styles = StyleSheet.create({
  subtitulo: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  contrasena: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
  entradaContrasena: { flex: 1, minWidth: 0, borderWidth: 0 },
  ojo: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  grupo: { gap: Spacing.two },
  campo: {
    minHeight: 48,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
  },
});
