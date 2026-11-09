import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SesionProvider } from "@/contextos/sesion";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useTheme } from "@/hooks/use-theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colores = useTheme();
  const temaBase = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const tema = {
    ...temaBase,
    colors: {
      ...temaBase.colors,
      background: colores.background,
      card: colores.background,
    },
  };
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colores.background).catch(console.warn);
  }, [colores.background]);
  return (
    <ThemeProvider value={tema}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SesionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SesionProvider>
    </ThemeProvider>
  );
}
