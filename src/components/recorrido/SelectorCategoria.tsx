
import { useState } from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { BotonRecorrido } from "@/components/ui/botones-recorrido";

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
  const colores = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        style={[
          styles.input,
          {
            backgroundColor: colores.background,
            borderColor: colores.backgroundSelected,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons
          name="list-outline"
          size={20}
          color={colores.primary}
        />

        <ThemedText
          style={[
            styles.textoInput,
            {
              color: categoriaSeleccionada
                ? colores.text
                : colores.textSecondary,
            },
          ]}
        >
          {categoriaSeleccionada
            ? categoriaSeleccionada.nombre
            : "Seleccioná una categoría"}
        </ThemedText>

        <Ionicons
          name="chevron-down"
          size={20}
          color={colores.textSecondary}
        />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalFondo}>
          <ThemedView
            style={[
              styles.modalContenido,
              {
                backgroundColor: colores.backgroundElement,
                borderColor: colores.backgroundSelected,
              },
            ]}
          >
            <ThemedView style={styles.encabezadoModal}>
              <ThemedText type="subtitle">
                Seleccioná una categoría
              </ThemedText>

              <ThemedText
                style={[
                  styles.descripcionModal,
                  { color: colores.textSecondary },
                ]}
              >
                Elegí la categoría del lugar que visitaste.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.listaCategorias}>
              {categorias.map((categoria) => {
                const seleccionada =
                  categoriaSeleccionada?.id === categoria.id;

                return (
                  <Pressable
                    key={categoria.id}
                    onPress={() => {
                      onSeleccionar(categoria);
                      setModalVisible(false);
                    }}
                    style={[
                      styles.opcionCategoria,
                      {
                        backgroundColor: seleccionada
                          ? colores.secondary
                          : colores.background,
                        borderColor: seleccionada
                          ? colores.primary
                          : colores.backgroundSelected,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.textoCategoria,
                        {
                          color: seleccionada
                            ? colores.textContent
                            : colores.text,
                        },
                      ]}
                    >
                      {categoria.nombre}
                    </ThemedText>

                    {seleccionada && (
                      <Ionicons
                        name="checkmark-circle"
                        size={21}
                        color={colores.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ThemedView>

            <BotonRecorrido
              titulo="Cerrar"
              icono="close-outline"
              variante="contorno"
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
    minHeight: 52,
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  textoInput: {
    flex: 1,
    fontSize: 15,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.three,
  },
  modalContenido: {
    width: "100%",
    maxWidth: 420,
    padding: Spacing.three,
    borderRadius: 22,
    borderWidth: 1,
    gap: Spacing.three,
  },
  encabezadoModal: {
    backgroundColor: "transparent",
    alignItems: "center",
    gap: Spacing.two,
  },
  descripcionModal: {
    fontSize: 14,
    textAlign: "center",
  },
  listaCategorias: {
    backgroundColor: "transparent",
    gap: Spacing.two,
  },
  opcionCategoria: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textoCategoria: {
    fontSize: 15,
    fontWeight: "500",
  },
});