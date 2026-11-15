import { useRef, useState } from "react";

import {
  Button,
  Modal,
  StyleSheet,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type Props = {
  fotoUri: string | null;
  onFotoTomada: (uri: string) => void;
};

export function CamaraVisita({
  fotoUri,
  onFotoTomada,
}: Props) {
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
      {/* Campo fotografía */}
      <ThemedView style={styles.input}>
        <ThemedText>
          {fotoUri
            ? fotoUri.split("/").pop()
            : "No se tomo ninguna fotografía (opcional)"}
        </ThemedText>
      </ThemedView>

      <Button title="Sacar fotografía" onPress={abrirCamara} />

      <Modal
        visible={camaraVisible}
        animationType="slide"
        onRequestClose={() => setCamaraVisible(false)}
      >
        <ThemedView style={{ flex: 1 }}>
          <CameraView
            ref={camaraRef}
            style={{ flex: 1 }}
            facing="back"
          />

          <Button
            title="Tomar fotografía"
            onPress={sacarFotografia}
          />

          <Button
            title="Cerrar cámara"
            onPress={() => setCamaraVisible(false)}
          />
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
});
