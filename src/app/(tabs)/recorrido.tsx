import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function RecorridoScreen() {
  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="title">Mi recorrido</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: "center", justifyContent: "center" },
});
