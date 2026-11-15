
import { useState } from "react";

import {
  Button,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import type { Categoria } from "@/tipos/recorrido";

type Props = {
  categorias: Categoria[];
  categoriaSeleccionada: Categoria | null;
  onSeleccionar: (categoria: Categoria) => void;
};

export function SelectorCategoria({
  categorias,
  categoriaSeleccionada,
  onSeleccionar,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <ThemedText>
          {categoriaSeleccionada
            ? categoriaSeleccionada.nombre
            : "Seleccione una categoría"}
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
              Seleccione una categoría
            </ThemedText>

            {categorias.map((categoria) => (
              <Pressable
                key={categoria.id}
                onPress={() => {
                  onSeleccionar(categoria);
                  setModalVisible(false);
                }}
              >
                <ThemedText>{categoria.nombre}</ThemedText>
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

