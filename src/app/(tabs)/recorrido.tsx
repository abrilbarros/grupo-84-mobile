import { useState } from "react";

import { StyleSheet, ActivityIndicator, Modal, Alert } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { useSesion } from "@/contextos/sesion";
import { FormularioVisita } from "@/components/recorrido/FormularioVisita";
import { LectorQR } from "@/components/recorrido/LectorQR";
import { ListaVisitas } from "@/components/ui/ListaVisitas";

import type { Lugar } from "@/tipos/recorrido";

import * as Location from "expo-location";

import { BotonRecorrido } from "@/components/ui/botones-recorrido";

import Ionicons from "@react-native-vector-icons/ionicons";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

import { obtenerLugaresCercanos } from "@/servicios/recorrido";
import { useCatalogoDeLugares } from "@/funcionalidades/mapa-y-lugares/hooks/use-catalogo-de-lugares";
import { useRecorridoDelUsuario } from "@/funcionalidades/mi-recorrido/hooks/use-recorrido-del-usuario";

export default function RecorridoScreen() {
  const { sesion } = useSesion();
  const [modalVisible, setModalVisible] = useState(false);
  const [metodoRegistro, setMetodoRegistro] = useState<string | null>(null);
  const [lugarQR, setLugarQR] = useState<Lugar | null>(null);
  const [lugarGPS, setLugarGPS] = useState<Lugar | null>(null);
  const [buscandoGPS, setBuscandoGPS] = useState(false);
  const colores = useTheme();
  const catalogo = useCatalogoDeLugares();
  const {
    visitas,
    estaCargando: cargandoVisitas,
    recargar: actualizarVisitas,
  } = useRecorridoDelUsuario(
    sesion?.token ?? null,
    sesion?.usuario.id ?? null,
  );

  const buscarLugarPorGPS = async () => {
    try {
      visitas.length === 0;
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
        <ThemedView style={styles.estadoSinSesion}>
          <ThemedView
            style={[
              styles.iconoSinSesion,
              { backgroundColor: colores.secondary },
            ]}
          >
            <Ionicons name="map-outline" size={38} color={colores.primary} />
          </ThemedView>

          <ThemedText type="subtitle" style={styles.tituloSinSesion}>
            Tu recorrido te espera
          </ThemedText>

          <ThemedText
            style={[
              styles.descripcionSinSesion,
              { color: colores.textSecondary },
            ]}
          >
            Iniciá sesión para consultar tus visitas y guardar los lugares que
            recorras.
          </ThemedText>

          <ThemedText
            style={[
              styles.indicacionSinSesion,
              { color: colores.textSecondary },
            ]}
          >
            Dirigite a la sección Perfil para iniciar sesión o crear una cuenta.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }
  if (buscandoGPS) {
    return (
      <ThemedView style={styles.estadoBusqueda}>
        <ThemedView
          style={[styles.iconoBusqueda, { backgroundColor: colores.secondary }]}
        >
          <Ionicons name="navigate-outline" size={38} color={colores.primary} />
        </ThemedView>

        <ThemedText type="subtitle" style={styles.tituloBusqueda}>
          Buscando lugares cercanos...
        </ThemedText>

        <ThemedText
          style={[styles.descripcionBusqueda, { color: colores.textSecondary }]}
        >
          Estamos buscando lugares cerca de tu ubicación. Esto puede tardar unos
          segundos.
        </ThemedText>

        <ActivityIndicator size="large" color={colores.primary} />
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
        usuarioId={sesion.usuario.id}
        lugarInicial={lugarQR}
        onCancelar={() => {
          setLugarQR(null);
          setMetodoRegistro(null);
          actualizarVisitas();
        }}
      />
    );
  }

  if (metodoRegistro === "gps" && lugarGPS) {
    return (
      <FormularioVisita
        metodo="gps"
        usuarioId={sesion.usuario.id}
        lugarInicial={lugarGPS}
        onCancelar={() => {
          setLugarGPS(null);
          setMetodoRegistro(null);
          actualizarVisitas();
        }}
      />
    );
  }

  if (metodoRegistro === "manual") {
    return (
      <FormularioVisita
        metodo="manual"
        usuarioId={sesion.usuario.id}
        onCancelar={() => {
          setMetodoRegistro(null);
          actualizarVisitas();
        }}
      />
    );
  }

  // Pantalla principal con el botón y el modal con las 3 opciones

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedView style={styles.encabezado}>
        <ThemedText style={styles.subtitulo}>
          Tus lugares visitados y experiencias.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.contenido}>
        {cargandoVisitas ? (
          <ThemedView style={styles.estadoCarga}>
            <ActivityIndicator size="large" color={colores.primary} />

            <ThemedText type="subtitle" style={styles.tituloCarga}>
              Cargando tu recorrido...
            </ThemedText>

            <ThemedText style={{ color: colores.textSecondary }}>
              Estamos buscando tus visitas.
            </ThemedText>
          </ThemedView>
        ) : visitas.length === 0 ? (
          <ThemedView style={styles.estadoVacio}>
            <ThemedView
              style={[
                styles.iconoVacio,
                { backgroundColor: colores.secondary },
              ]}
            >
              <Ionicons name="map-outline" size={38} color={colores.primary} />
            </ThemedView>

            <ThemedText type="subtitle" style={styles.tituloVacio}>
              ¡Tu recorrido comienza acá!
            </ThemedText>

            <ThemedText
              style={[
                styles.descripcionVacia,
                { color: colores.textSecondary },
              ]}
            >
              Aún no tenés visitas registradas. Explorá lugares y comenzá a
              guardar tus experiencias.
            </ThemedText>
          </ThemedView>
        ) : (
          <ListaVisitas
            visitas={visitas}
            lugares={catalogo.lugares}
            categorias={catalogo.categorias}
          />
        )}
      </ThemedView>

      <ThemedView style={styles.pie}>
        <BotonRecorrido
          titulo="Registrar visita"
          icono="add-circle-outline"
          onPress={() => setModalVisible(true)}
        />
      </ThemedView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalFondo}>
          <ThemedView style={styles.modalTarjeta}>
            <ThemedText type="subtitle" style={styles.modalTitulo}>
              Elegí un método de registro
            </ThemedText>

            <ThemedText
              style={[
                styles.modalDescripcion,
                { color: colores.textSecondary },
              ]}
            >
              ¿Cómo querés registrar tu visita?
            </ThemedText>

            <ThemedView style={styles.opcionesModal}>
              <BotonRecorrido
                titulo="Escanear QR"
                icono="qr-code-outline"
                variante="secundario"
                onPress={() => {
                  setMetodoRegistro("QR");
                  setModalVisible(false);
                }}
              />

              <BotonRecorrido
                titulo={buscandoGPS ? "Buscando ubicación..." : "Usar GPS"}
                icono="navigate-outline"
                variante="secundario"
                disabled={buscandoGPS}
                onPress={() => {
                  setModalVisible(false);
                  buscarLugarPorGPS();
                }}
              />

              <BotonRecorrido
                titulo="Carga manual"
                icono="create-outline"
                variante="secundario"
                onPress={() => {
                  setMetodoRegistro("manual");
                  setModalVisible(false);
                }}
              />
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 4,
  },
  contenido: {
    flex: 1,
  },
  pie: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  subtitulo: {
    fontSize: 17,
    fontWeight: "500",
  },
  estadoVacio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  iconoVacio: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  descripcionVacia: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 23,
  },
  tituloVacio: {
    width: "100%",
    textAlign: "center",
  },

  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalTarjeta: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 22,
    padding: 24,
    gap: 18,
  },
  modalTitulo: {
    textAlign: "center",
  },
  modalDescripcion: {
    fontSize: 14,
    textAlign: "center",
  },
  opcionesModal: {
    gap: 12,
  },
  estadoBusqueda: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  tituloBusqueda: {
    width: "100%",
    textAlign: "center",
  },
  iconoBusqueda: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  descripcionBusqueda: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 23,
  },
  estadoSinSesion: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 18,
  },
  iconoSinSesion: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  tituloSinSesion: {
    width: "100%",
    textAlign: "center",
  },
  descripcionSinSesion: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 23,
  },
  indicacionSinSesion: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "500",
  },
  estadoCarga: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    padding: Spacing.four,
    gap: Spacing.three,
    minHeight: 220,
  },
  tituloCarga: {
  width: "100%",
  textAlign: "center",
},
});
