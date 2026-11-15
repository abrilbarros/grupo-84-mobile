
import { useRef, useState, useEffect } from "react";

import { Alert, StyleSheet } from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { BotonRecorrido } from "@/components/ui/botones-recorrido";

import { obtenerLugarPorQr } from "@/servicios/recorrido";
import type { Lugar } from "@/tipos/recorrido";

type Props = {
  onLugarEncontrado: (lugar: Lugar) => void;
  onCancelar: () => void;
};

export function LectorQR({ onLugarEncontrado, onCancelar }: Props) {
  const [permisoCamara, solicitarPermisoCamara] = useCameraPermissions();

  useEffect(() => {
    async function solicitarPermiso() {
      const resultado = await solicitarPermisoCamara();

      if (!resultado.granted) {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos acceder a la cámara para escanear códigos QR.",
          [
            {
              text: "Aceptar",
              onPress: onCancelar,
            },
          ],
        );
      }
    }

    solicitarPermiso();
  }, []);

  const [procesando, setProcesando] = useState(false);

  const procesandoRef = useRef(false);

  async function leerCodigo(codigo: string) {
    console.log("ENTRÉ A LEER CÓDIGO:", codigo);

    if (procesandoRef.current) return;

    procesandoRef.current = true;
    setProcesando(true);

    try {
      try {
        console.log("Código recibido:", codigo);
        console.log("Consultando al backend...");

        const lugar = await obtenerLugarPorQr(codigo);

        console.log("Respuesta del backend:", lugar);

        onLugarEncontrado(lugar);
      } catch (error) {
        console.error("Error al validar el QR:", error);

        Alert.alert(
          "Código QR no válido",
          "No pudimos encontrar un lugar con ese código. Intentá nuevamente.",
        );

        procesandoRef.current = false;
        setProcesando(false);
      }
    } catch (error) {
      console.error("Error al validar el QR:", error);

      Alert.alert(
        "Código QR no válido",
        "No pudimos encontrar un lugar con ese código. Intentá nuevamente.",
      );

      procesandoRef.current = false;
      setProcesando(false);
    }
  }

  if (!permisoCamara || !permisoCamara.granted) {
    return (
      <ThemedView style={styles.contenedorPermiso}>
        <ThemedText>
          Solicitando permiso para usar la cámara...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.contenedor}>
      <CameraView
        style={styles.camara}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          procesando
            ? undefined
            : ({ data, type }) => {
                console.log("TIPO DE CÓDIGO:", type);
                console.log("CONTENIDO LEÍDO:", data);
                leerCodigo(data);
              }
        }
      />

      <ThemedView style={styles.controles}>
        <ThemedText>
          {procesando
            ? "Validando código QR..."
            : "Apuntá la cámara al código QR"}
        </ThemedText>

        <BotonRecorrido
          titulo="Cancelar escaneo"
          icono="close-outline"
          variante="contorno"
          onPress={onCancelar}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  contenedorPermiso: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.three,
  },
  camara: {
    flex: 1,
  },
  controles: {
    alignItems: "center",
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
