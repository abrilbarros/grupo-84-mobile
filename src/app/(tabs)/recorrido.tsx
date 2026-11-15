import { useState } from "react";

import { StyleSheet, Button, Modal } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { useSesion } from "@/contextos/sesion";
import { FormularioVisita } from "@/components/recorrido/FormularioVisita";

import { LectorQR } from "@/components/recorrido/LectorQR";
import type { Lugar } from "@/tipos/recorrido";

import * as Location from "expo-location";
import { Alert } from "react-native";

import { obtenerLugaresCercanos } from "@/servicios/recorrido";

export default function RecorridoScreen() {
  const { sesion } = useSesion();
  const [modalVisible, setModalVisible] = useState(false);
  const [metodoRegistro, setMetodoRegistro] = useState<string | null>(null);
  const [lugarQR, setLugarQR] = useState<Lugar | null>(null);
  const [lugarGPS, setLugarGPS] = useState<Lugar | null>(null);
  const [buscandoGPS, setBuscandoGPS] = useState(false);

  const buscarLugarPorGPS = async () => {
    try {
      setBuscandoGPS(true);

      // 1. Solicitar permiso para acceder a la ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos acceder a tu ubicación para encontrar lugares cercanos.",
        );
        return;
      }

      // 2. Obtener ubicación actual del celular
      const ubicacion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = ubicacion.coords;

      // UBICACIÓN SIMULADA PARA LA PRUEBA
      //const latitude = -32.2192;
      //const longitude = -58.1318;

      // 3. Consultar lugares dentro de un radio de 50 metros
      const lugares = await obtenerLugaresCercanos(latitude, longitude, 50);

      // 4. Si no hay lugares cercanos
      if (lugares.length === 0) {
        Alert.alert(
          "Sin lugares cercanos",
          "No estás cerca de ningún lugar, cargalo a mano.",
        );
        return;
      }

      // 5. Calcular cuál es el lugar más cercano
      const distanciaEnMetros = (lugar: Lugar) => {
        if (!lugar.coordenadas) return Infinity;

        const lat1 = latitude * (Math.PI / 180);
        const lon1 = longitude * (Math.PI / 180);
        const lat2 = lugar.coordenadas.latitud * (Math.PI / 180);
        const lon2 = lugar.coordenadas.longitud * (Math.PI / 180);

        const diferenciaLatitud = lat2 - lat1;
        const diferenciaLongitud = lon2 - lon1;

        const a =
          Math.sin(diferenciaLatitud / 2) ** 2 +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(diferenciaLongitud / 2) ** 2;

        const distancia =
          6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return distancia;
      };

      const lugarMasCercano = lugares.reduce((masCercano, lugar) =>
        distanciaEnMetros(lugar) < distanciaEnMetros(masCercano)
          ? lugar
          : masCercano,
      );

      // 6. Abrir el formulario con el lugar encontrado
      setLugarGPS(lugarMasCercano);
      setMetodoRegistro("gps");
    } catch (error) {
      console.error("Error al buscar lugares por GPS:", error);
      Alert.alert(
        "Error de ubicación",
        "No pudimos obtener tu ubicación. Intentá nuevamente.",
      );
    } finally {
      setBuscandoGPS(false);
    }
  };

  // 1. Si no hay sesión, muestra esto
  if (!sesion) {
    return (
      <ThemedView style={styles.contenedor}>
        <ThemedText>Inicia sesion para ver o cargar tus recorridos</ThemedText>
      </ThemedView>
    );
  }

  if (metodoRegistro === "QR") {
    return (
      <LectorQR
        onLugarEncontrado={(lugar) => {
          setLugarQR(lugar);
          setMetodoRegistro("qr");
        }}
        onCancelar={() => setMetodoRegistro(null)}
      />
    );
  }

  if (metodoRegistro === "qr" && lugarQR) {
    return (
      <FormularioVisita
        metodo="qr"
        token={sesion.token}
        lugarInicial={lugarQR}
        onCancelar={() => {
          setLugarQR(null);
          setMetodoRegistro(null);
        }}
      />
    );
  }

  if (metodoRegistro === "gps" && lugarGPS) {
    return (
      <FormularioVisita
        metodo="gps"
        token={sesion.token}
        lugarInicial={lugarGPS}
        onCancelar={() => {
          setLugarGPS(null);
          setMetodoRegistro(null);
        }}
      />
    );
  }

  if (metodoRegistro === "manual") {
    return (
      <FormularioVisita
        metodo="manual"
        token={sesion.token}
        onCancelar={() => setMetodoRegistro(null)}
      />
    );
  }

  // Pantalla principal con el botón y el modal con las 3 opciones
  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText>Aún no tenés visitas registradas</ThemedText>
      <Button title="Registrar visita" onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <ThemedView style={styles.contenedor}>
          <ThemedText>Elegí un método de registro</ThemedText>

          <Button
            title="Escanear QR"
            onPress={() => {
              setMetodoRegistro("QR");
              setModalVisible(false);
            }}
          />

          <Button
            title={buscandoGPS ? "Buscando ubicación..." : "Usar GPS"}
            disabled={buscandoGPS}
            onPress={() => {
              setModalVisible(false);
              buscarLugarPorGPS();
            }}
          />

          <Button
            title="Carga Manual"
            onPress={() => {
              setMetodoRegistro("manual");
              setModalVisible(false);
            }}
          />

          <Button title="Cerrar" onPress={() => setModalVisible(false)} />
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
