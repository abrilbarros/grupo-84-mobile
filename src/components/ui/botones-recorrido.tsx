
  import type { ComponentProps } from "react";
  import { Pressable, StyleSheet } from "react-native";
  import Ionicons from "@react-native-vector-icons/ionicons";

  import { ThemedText } from "@/components/themed-text";
  import { useTheme } from "@/hooks/use-theme";
  import { Spacing } from "@/constants/theme";

  type Icono = ComponentProps<typeof Ionicons>["name"];

  type Variante = "principal" | "secundario" | "contorno" | "peligro";

  type Props = {
    titulo: string;
    onPress: () => void;
    icono?: Icono;
    variante?: Variante;
    disabled?: boolean;
  };

  export function BotonRecorrido({
    titulo,
    onPress,
    icono,
    variante = "principal",
    disabled = false,
  }: Props) {
    const colores = useTheme();

    const estilos = {
      principal: {
        fondo: colores.primary,
        texto: colores.onPrimary,
        borde: colores.primary,
      },
      secundario: {
        fondo: colores.secondary,
        texto: colores.textContent,
        borde: colores.secondary,
      },
      contorno: {
        fondo: "transparent",
        texto: colores.primary,
        borde: colores.primary,
      },
      peligro: {
        fondo: colores.errorBackground,
        texto: colores.error,
        borde: colores.errorBackground,
      },
    }[variante];

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.boton,
          {
            backgroundColor: estilos.fondo,
            borderColor: estilos.borde,
            opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
      >
        {icono && (
          <Ionicons
            name={icono}
            size={21}
            color={estilos.texto}
          />
        )}

        <ThemedText style={[styles.texto, { color: estilos.texto }]}>
          {titulo}
        </ThemedText>
      </Pressable>
    );
  }

  const styles = StyleSheet.create({
    boton: {
      minHeight: 52,
      width: "100%",
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
    },
    texto: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
