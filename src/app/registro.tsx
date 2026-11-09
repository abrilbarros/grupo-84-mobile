import { useEffect, useRef, useState } from "react";
import { Redirect, router } from "expo-router";
import { Keyboard, TextInput } from "react-native";
import {
  CuentaBoton,
  CuentaCampo,
  CuentaContenedor,
  CuentaError,
  CuentaLogo,
} from "@/components/cuenta-ui";
import { ThemedText } from "@/components/themed-text";
import { ErrorSesionSegura, useSesion } from "@/contextos/sesion";
import { CuentaVerificacion } from "@/components/cuenta-verificacion";
import { useTheme } from "@/hooks/use-theme";
import {
  registrar,
  validarRegistro,
  mensajeDeRegistro,
  type ErroresRegistro,
} from "@/servicios/cuenta";

export default function RegistroScreen() {
  const colores = useTheme();
  const { sesion, iniciarSesion, restaurando, errorRestauracion } = useSesion();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState<ErroresRegistro>({});
  const [error, setError] = useState<string>();
  const [cargando, setCargando] = useState(false);
  const solicitud = useRef<AbortController | null>(null);
  const campoEmail = useRef<TextInput>(null);
  const campoContrasena = useRef<TextInput>(null);
  useEffect(() => () => solicitud.current?.abort(), []);

  function limpiarError(campo: keyof ErroresRegistro) {
    setErrores((previos) => ({ ...previos, [campo]: undefined }));
    setError(undefined);
  }

  async function enviar() {
    if (solicitud.current) return;
    const datos = { nombre, email, contrasena };
    const validacion = validarRegistro(datos);
    setErrores(validacion);
    setError(undefined);
    if (Object.keys(validacion).length) return;
    Keyboard.dismiss();
    const control = new AbortController();
    solicitud.current = control;
    setCargando(true);
    try {
      const nuevaSesion = await registrar(datos, control.signal);
      if (control.signal.aborted) return;
      setContrasena("");
      await iniciarSesion(nuevaSesion);
      if (control.signal.aborted) return;
      router.replace("/(tabs)/perfil");
    } catch (fallo) {
      if (!control.signal.aborted)
        setError(
          fallo instanceof ErrorSesionSegura
            ? fallo.message
            : mensajeDeRegistro(fallo),
        );
    } finally {
      solicitud.current = null;
      if (!control.signal.aborted) setCargando(false);
    }
  }

  if (restaurando || errorRestauracion) return <CuentaVerificacion />;
  if (sesion) return <Redirect href="/(tabs)/perfil" />;
  return (
    <CuentaContenedor>
      <CuentaLogo />
      <ThemedText
        role="heading"
        style={{
          color: colores.textContent,
          fontSize: 26,
          lineHeight: 34,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        Crear una cuenta
      </ThemedText>
      <CuentaCampo
        etiqueta="Nombre"
        value={nombre}
        error={errores.nombre}
        editable={!cargando}
        onChangeText={(valor) => {
          setNombre(valor);
          limpiarError("nombre");
        }}
        autoComplete="name"
        autoCapitalize="words"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => campoEmail.current?.focus()}
      />
      <CuentaCampo
        etiqueta="Correo electrónico"
        value={email}
        error={errores.email}
        editable={!cargando}
        inputRef={campoEmail}
        onChangeText={(valor) => {
          setEmail(valor);
          limpiarError("email");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => campoContrasena.current?.focus()}
      />
      <CuentaCampo
        etiqueta="Contraseña"
        value={contrasena}
        error={errores.contrasena}
        editable={!cargando}
        inputRef={campoContrasena}
        onChangeText={(valor) => {
          setContrasena(valor);
          limpiarError("contrasena");
        }}
        esContrasena
        autoComplete="new-password"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="go"
        onSubmitEditing={enviar}
      />
      <ThemedText style={{ color: colores.textContent }}>
        La contraseña debe tener entre 8 y 200 caracteres.
      </ThemedText>
      <CuentaError mensaje={error} />
      <CuentaBoton
        titulo="Crear cuenta"
        onPress={enviar}
        cargando={cargando}
        textoCarga="Creando cuenta…"
      />
      <CuentaBoton
        titulo="Ya tengo cuenta. Iniciar sesión"
        secundario
        onPress={() => router.replace("/login")}
      />
    </CuentaContenedor>
  );
}
