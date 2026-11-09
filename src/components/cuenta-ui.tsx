import {
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
export { CuentaLogo } from "@/components/cuenta-logo";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAccountTheme } from "@/hooks/use-theme";

export function CuentaContenedor({
  children,
  conEncabezado = false,
}: {
  children: ReactNode;
  conEncabezado?: boolean;
}) {
  const colores = useAccountTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={[styles.pantalla, { backgroundColor: colores.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.contenido,
          {
            paddingTop: (conEncabezado ? 0 : insets.top) + Spacing.four,
            paddingBottom: insets.bottom + Spacing.four,
          },
        ]}
      >
        <View style={styles.columna}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function CuentaBoton({
  titulo,
  onPress,
  cargando = false,
  secundario = false,
  conBorde = false,
  icono,
  tamanoTexto = 16,
  tamanoIcono = 20,
  textoCarga = "Ingresando…",
}: {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  secundario?: boolean;
  conBorde?: boolean;
  icono?: ComponentProps<typeof Ionicons>["name"];
  tamanoTexto?: number;
  tamanoIcono?: number;
  textoCarga?: string;
}) {
  const colores = useAccountTheme();
  const texto = secundario ? colores.primary : colores.onPrimary;
  const anchoBorde = secundario && !conBorde ? 0 : 1;
  let fondoNormal: string = colores.primary;
  if (secundario) {
    fondoNormal = conBorde ? "transparent" : colores.background;
  }
  const fondoPresionado = secundario ? colores.secondary : colores.primary;

  return (
    <Pressable
      role="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: cargando, busy: cargando }}
      disabled={cargando}
      onPress={onPress}
      style={({ pressed }) => [
        styles.boton,
        {
          backgroundColor: pressed ? fondoPresionado : fondoNormal,
          borderColor: colores.primary,
          borderWidth: anchoBorde,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      {cargando && (
        <ActivityIndicator
          color={texto}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      )}
      {icono && !cargando && (
        <Ionicons
          name={icono}
          size={tamanoIcono}
          color={texto}
          accessible={false}
        />
      )}
      <ThemedText
        style={{
          color: texto,
          fontSize: tamanoTexto,
          fontWeight: secundario ? "500" : "700",
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {cargando ? textoCarga : titulo}
      </ThemedText>
    </Pressable>
  );
}

export function CuentaCampo({
  etiqueta,
  error,
  esContrasena = false,
  inputRef,
  ...props
}: TextInputProps & {
  etiqueta: string;
  error?: string;
  esContrasena?: boolean;
  inputRef?: RefObject<TextInput | null>;
}) {
  const colores = useAccountTheme();
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: Spacing.two }}>
      <ThemedText style={{ color: colores.text }}>{etiqueta}</ThemedText>
      <View style={[styles.campo, { borderColor: colores.primary }]}>
        <TextInput
          {...props}
          ref={inputRef}
          accessibilityLabel={etiqueta}
          aria-invalid={!!error}
          secureTextEntry={esContrasena && !visible}
          placeholderTextColor={colores.primary}
          style={[styles.entrada, { color: colores.text }, props.style]}
        />
        {esContrasena && (
          <Pressable
            role="button"
            accessibilityLabel={
              visible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            accessibilityState={{ disabled: props.editable === false }}
            disabled={props.editable === false}
            onPress={() => setVisible((valor) => !valor)}
            style={styles.ojo}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colores.primary}
              accessible={false}
            />
          </Pressable>
        )}
      </View>
      <CuentaError mensaje={error} />
    </View>
  );
}

export function CuentaError({ mensaje }: { mensaje?: string }) {
  const colores = useAccountTheme();
  if (!mensaje) return null;
  return (
    <View style={[styles.error, { backgroundColor: colores.errorBackground }]}>
      <ThemedText
        accessibilityLiveRegion="polite"
        style={{ color: colores.error }}
      >
        {mensaje}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
  entrada: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    padding: Spacing.three,
    fontSize: 16,
  },
  ojo: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  pantalla: { flex: 1 },
  contenido: { flexGrow: 1, paddingHorizontal: Spacing.four },
  columna: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    gap: Spacing.four,
  },
  boton: {
    minHeight: 48,
    minWidth: 48,
    padding: Spacing.three,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
  },
  error: { padding: Spacing.three, borderRadius: Spacing.two },
});
