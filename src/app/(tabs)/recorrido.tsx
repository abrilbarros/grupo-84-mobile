import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  StyleSheet,
  Button,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  useColorScheme,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { obtenerCategorias, obtenerLugares } from "@/servicios/recorrido";
import { useSesion } from "@/contextos/sesion";
import { Colors } from "@/constants/theme";

export default function RecorridoScreen() {
  const { sesion } = useSesion();
  const [modalVisible, setModalVisible] = useState(false);
  const [metodoRegistro, setMetodoRegistro] = useState<string | null>(null);
  const [lugar, setLugar] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaHora, setFechaHora] = useState(new Date().toLocaleString()); // Arranca con la fecha/hora actual por defecto
  const [notaPersonal, setNotaPersonal] = useState("");
  const [foto, setFoto] = useState<string | null>(null);

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
      <ThemedView style={styles.contenedor}>
        <ThemedText type="title">Escáner QR</ThemedText>
        <ThemedText>Acá va a prenderse la cámara para escanear</ThemedText>
        <Button
          title="Cancelar y volver"
          onPress={() => setMetodoRegistro(null)}
        />
      </ThemedView>
    );
  }

  if (metodoRegistro === "Manual") {
    return (
      <FormularioVisita
        metodo="Manual"
        onCancelar={() => setMetodoRegistro(null)}
      />
    );
  }

  // 3. Pantalla principal con el botón y el modal con las 3 opciones
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
            title="Usar GPS"
            onPress={() => {
              setMetodoRegistro("GPS");
              setModalVisible(false);
            }}
          />

          <Button
            title="Carga Manual"
            onPress={() => {
              setMetodoRegistro("Manual");
              setModalVisible(false);
            }}
          />

          <Button title="Cerrar" onPress={() => setModalVisible(false)} />
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

type Categoria = {
  id: string;
  nombre: string;
};

type Lugar = {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
};

function FormularioVisita({
  metodo,
  onCancelar,
}: {
  metodo: string;
  onCancelar: () => void;
}) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState<Lugar | null>(
    null,
  );
  const [modalLugarVisible, setModalLugarVisible] = useState(false);
  const [fechaHora, setFechaHora] = useState(new Date());
  const [nota, setNota] = useState("");
  const theme = useColorScheme() === "dark" ? Colors.dark : Colors.light;
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [permisoCamara, solicitarPermisoCamara] = useCameraPermissions();
  const [camaraVisible, setCamaraVisible] = useState(false);

  //CATEGORIAS
  useEffect(() => {
    async function cargarCategorias() {
      try {
        const datos = await obtenerCategorias();
        setCategorias(datos);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    }

    cargarCategorias();
  }, []);

  //LUGARES
  useEffect(() => {
    async function cargarLugares() {
      if (!categoriaSeleccionada) return;

      try {
        const datos = await obtenerLugares(categoriaSeleccionada.id);
        setLugares(datos);
      } catch (error) {
        console.error("Error al cargar los lugares:", error);
      }
    }

    cargarLugares();
  }, [categoriaSeleccionada]);

  // Camara
  const camaraRef = useRef<CameraView>(null);

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
      setFotoUri(foto.uri);
      setCamaraVisible(false);
    }
  }

  return (
    <ScrollView>
      <ThemedView style={styles.contenedor}>
        <ThemedText type="title">Registrar Visita</ThemedText>

        {/* Campo categoria */}
        <Pressable
          style={styles.input}
          onPress={() => setModalCategoriaVisible(true)}
        >
          <ThemedText>
            {categoriaSeleccionada
              ? categoriaSeleccionada.nombre
              : "Seleccione una categoría"}
          </ThemedText>
        </Pressable>

        <Modal
          visible={modalCategoriaVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalCategoriaVisible(false)}
        >
          <ThemedView style={styles.modalFondo}>
            <ThemedView style={styles.modalContenido}>
              <ThemedText type="subtitle">Seleccione una categoría</ThemedText>

              {categorias.map((categoria) => (
                <Pressable
                  key={categoria.id}
                  onPress={() => {
                    setCategoriaSeleccionada(categoria);
                    setLugarSeleccionado(null);
                    setLugares([]);
                    setModalCategoriaVisible(false);
                  }}
                >
                  <ThemedText>{categoria.nombre}</ThemedText>
                </Pressable>
              ))}

              <Button
                title="Cerrar"
                onPress={() => setModalCategoriaVisible(false)}
              />
            </ThemedView>
          </ThemedView>
        </Modal>

        {/* Campo lugar */}
        <Pressable
          style={styles.input}
          onPress={() => setModalLugarVisible(true)}
          disabled={!categoriaSeleccionada}
        >
          <ThemedText>
            {lugarSeleccionado
              ? lugarSeleccionado.nombre
              : "Seleccione un lugar"}
          </ThemedText>
        </Pressable>

        <Modal
          visible={modalLugarVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalLugarVisible(false)}
        >
          <ThemedView style={styles.modalFondo}>
            <ThemedView style={styles.modalContenido}>
              <ThemedText type="subtitle">Seleccione un lugar</ThemedText>

              {lugares.map((lugar) => (
                <Pressable
                  key={lugar.id}
                  onPress={() => {
                    setLugarSeleccionado(lugar);
                    setModalLugarVisible(false);
                  }}
                >
                  <ThemedText>{lugar.nombre}</ThemedText>
                </Pressable>
              ))}

              <Button
                title="Cerrar"
                onPress={() => setModalLugarVisible(false)}
              />
            </ThemedView>
          </ThemedView>
        </Modal>

        {/* campo descripcion */}
        <ThemedView style={styles.input}>
          <ThemedText>
            {lugarSeleccionado
              ? lugarSeleccionado.descripcion
              : "Descripción del lugar"}
          </ThemedText>
        </ThemedView>

        {/* Campo fecha y hora */}
        <ThemedView style={styles.input}>
          <ThemedText>{fechaHora.toLocaleString("es-AR")}</ThemedText>
        </ThemedView>

        {/* Campo nota */}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
            },
          ]}
          placeholder="Dejá una nota (opcional)"
          placeholderTextColor={theme.textSecondary}
          value={nota}
          onChangeText={setNota}
          multiline
        />

        {/* Campo fotografía */}
        <ThemedView style={styles.input}>
          <ThemedText>
            {fotoUri
              ? fotoUri.split("/").pop()
              : "No se tomo ninguna fotografía"}
          </ThemedText>
        </ThemedView>

        <Button title="Sacar fotografía" onPress={abrirCamara} />

        <Modal
          visible={camaraVisible}
          animationType="slide"
          onRequestClose={() => setCamaraVisible(false)}
        >
          <ThemedView style={{ flex: 1 }}>
            <CameraView ref={camaraRef} style={{ flex: 1 }} facing="back" />

            <Button title="Tomar fotografía" onPress={sacarFotografia} />

            <Button
              title="Cerrar cámara"
              onPress={() => setCamaraVisible(false)}
            />
          </ThemedView>
        </Modal>

        <Button title="Cancelar y volver" onPress={onCancelar} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: "center", justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "80%",
    borderRadius: 8,
    marginVertical: 10,
    color: "#000",
  },
  campoProvisorio: {
    borderWidth: 1,
    borderColor: "#0a7ea4",
    borderStyle: "dashed",
    padding: 12,
    width: "80%",
    borderRadius: 8,
    marginVertical: 10,
    textAlign: "center",
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
