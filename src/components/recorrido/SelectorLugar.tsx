import { useState } from "react";

import { Modal, Pressable, StyleSheet } from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { BotonRecorrido } from "@/components/ui/botones-recorrido";

import type { Lugar } from "@/tipos/recorrido";

type Props = {
  lugares: Lugar[];
  lugarSeleccionado: Lugar | null;
  categoriaSeleccionada: boolean;
  cargando: boolean;
  onSeleccionar: (lugar: Lugar) => void;
};

export function SelectorLugar({
  lugares,
  lugarSeleccionado,
  categoriaSeleccionada,
  cargando,
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
            opacity: categoriaSeleccionada ? 1 : 0.5,
          },
        ]}
        onPress={() => setModalVisible(true)}
        disabled={!categoriaSeleccionada}
      >
        <Ionicons name="location-outline" size={20} color={colores.primary} />

        <ThemedText
          style={[
            styles.textoInput,
            {
              color: lugarSeleccionado ? colores.text : colores.textSecondary,
            },
          ]}
        >
          {lugarSeleccionado
            ? lugarSeleccionado.nombre
            : categoriaSeleccionada
              ? "Seleccioná un lugar"
              : "Primero seleccioná una categoría"}
        </ThemedText>

        <Ionicons name="chevron-down" size={20} color={colores.textSecondary} />
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
              <ThemedText type="subtitle">Seleccioná un lugar</ThemedText>

              <ThemedText
                style={[
                  styles.descripcionModal,
                  { color: colores.textSecondary },
                ]}
              >
                Elegí el lugar que visitaste.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.listaLugares}>
              {cargando ? (
                <ThemedText
                  style={[
                    styles.mensajeVacio,
                    { color: colores.textSecondary },
                  ]}
                >
                  Cargando lugares...
                </ThemedText>
              ) : lugares.length > 0 ? (
                lugares.map((lugar) => {
                  const seleccionado = lugarSeleccionado?.id === lugar.id;

                  return (
                    <Pressable
                      key={lugar.id}
                      onPress={() => {
                        onSeleccionar(lugar);
                        setModalVisible(false);
                      }}
                      style={[
                        styles.opcionLugar,
                        {
                          backgroundColor: seleccionado
                            ? colores.secondary
                            : colores.background,
                          borderColor: seleccionado
                            ? colores.primary
                            : colores.backgroundSelected,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.textoLugar,
                          {
                            color: seleccionado
                              ? colores.textContent
                              : colores.text,
                          },
                        ]}
                      >
                        {lugar.nombre}
                      </ThemedText>

                      {seleccionado && (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color={colores.primary}
                        />
                      )}
                    </Pressable>
                  );
                })
              ) : (
                <ThemedText
                  style={[
                    styles.mensajeVacio,
                    { color: colores.textSecondary },
                  ]}
                >
                  No hay lugares disponibles para esta categoría.
                </ThemedText>
              )}
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
  listaLugares: {
    backgroundColor: "transparent",
    gap: Spacing.two,
  },
  opcionLugar: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textoLugar: {
    fontSize: 15,
    fontWeight: "500",
  },
  mensajeVacio: {
    textAlign: "center",
    padding: Spacing.three,
    fontSize: 14,
  },
});
