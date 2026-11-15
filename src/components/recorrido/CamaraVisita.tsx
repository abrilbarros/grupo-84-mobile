
import { useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { BotonRecorrido } from "@/components/ui/botones-recorrido";

type Props = {
  fotoUri: string | null;
  onFotoTomada: (uri: string) => void;
};

export function CamaraVisita({
  fotoUri,
  onFotoTomada,
}: Props) {
  const colores = useTheme();

  const camaraRef = useRef<CameraView>(null);

  const [permisoCamara, solicitarPermisoCamara] =
    useCameraPermissions();

  const [camaraVisible, setCamaraVisible] = useState(false);

  async function abrirCamara() {
    if (!permisoCamara?.granted) {
      const permiso = await solicitarPermisoCamara();

      if (!permiso.granted) return;
    }

    setCamaraVisible(true);
  }

  async function sacarFotografia() {
    const foto = await camaraRef.current?.takePictureAsync();

    if (foto) {
      onFotoTomada(foto.uri);
      setCamaraVisible(false);
    }
  }

  return (
    <>
      <ThemedView style={styles.contenedor}>
        <ThemedView
          style={[
            styles.archivo,
            {
              backgroundColor: colores.backgroundSelected,
            },
          ]}
        >
          <ThemedText
            style={{ color: colores.textSecondary }}
          >
            {fotoUri
              ? fotoUri.split("/").pop()
              : "No se tomó ninguna fotografía."}
          </ThemedText>
        </ThemedView>

        <BotonRecorrido
          titulo={fotoUri ? "Volver a sacar fotografía" : "Sacar fotografía"}
          icono="camera-outline"
          variante="secundario"
          onPress={abrirCamara}
        />
      </ThemedView>

      <Modal
        visible={camaraVisible}
        animationType="slide"
        onRequestClose={() => setCamaraVisible(false)}
      >
        <ThemedView style={styles.modalCamara}>
          <CameraView
            ref={camaraRef}
            style={styles.camara}
            facing="back"
          />

          <ThemedView style={styles.controlesCamara}>
            <BotonRecorrido
              titulo="Tomar fotografía"
              icono="camera"
              onPress={sacarFotografia}
            />

            <BotonRecorrido
              titulo="Cerrar cámara"
              icono="close-outline"
              variante="contorno"
              onPress={() => setCamaraVisible(false)}
            />
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: "transparent",
    gap: Spacing.two,
  },
  archivo: {
    padding: Spacing.three,
    borderRadius: 12,
  },
  modalCamara: {
    flex: 1,
  },
  camara: {
    flex: 1,
  },
  controlesCamara: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
});

