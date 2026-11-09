import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function CuentaLogo() {
  const tema = useColorScheme();
  const logo = tema === "dark"
    ? require("@/assets/images/mi-ciudad-logo-oscuro.svg")
    : require("@/assets/images/mi-ciudad-logo-claro.svg");
  return (
    <Image
      source={logo}
      contentFit="contain"
      style={styles.logo}
      accessibilityLabel="Mi Ciudad"
    />
  );
}

const styles = StyleSheet.create({
  logo: { width: 72, height: 90, alignSelf: "center" },
});
