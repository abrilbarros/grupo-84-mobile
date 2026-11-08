import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { SesionProvider } from "@/contextos/sesion";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SesionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SesionProvider>
    </ThemeProvider>
  );
}
