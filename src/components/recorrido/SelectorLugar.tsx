import { useState } from "react";

import {
  Button,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { Lugar } from "@/tipos/recorrido";


type Props = {
  lugares: Lugar[];
  lugarSeleccionado: Lugar | null;
  categoriaSeleccionada: boolean;
  onSeleccionar: (lugar: Lugar) => void;
};

export function SelectorLugar({
  lugares,
  lugarSeleccionado,
  categoriaSeleccionada,
  onSeleccionar,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        style={styles.input}
        onPress={() => setModalVisible(true)}
        disabled={!categoriaSeleccionada}
      >
        <ThemedText>
          {lugarSeleccionado
            ? lugarSeleccionado.nombre
            : "Seleccione un lugar"}
        </ThemedText>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalFondo}>
          <ThemedView style={styles.modalContenido}>
            <ThemedText type="subtitle">
              Seleccione un lugar
            </ThemedText>

            {lugares.map((lugar) => (
              <Pressable
                key={lugar.id}
                onPress={() => {
                  onSeleccionar(lugar);
                  setModalVisible(false);
                }}
              >
                <ThemedText>{lugar.nombre}</ThemedText>
              </Pressable>
            ))}

            <Button
              title="Cerrar"
              onPress={() => setModalVisible(false)}
            />
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "80%",
    borderRadius: 8,
    marginVertical: 10,
    color: "#000",
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.89)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContenido: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
    gap: 15,
    alignItems: "center",
  },
});
