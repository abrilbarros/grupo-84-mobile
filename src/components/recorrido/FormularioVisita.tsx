import { useState, useEffect } from "react";

import {
  Button,
  ScrollView,
  TextInput,
  useColorScheme,
  StyleSheet,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";

import {
  obtenerCategorias,
  obtenerLugares,
  registrarVisita,
  subirFotografia,
  actualizarFotoVisita,
} from "@/servicios/recorrido";

import { OrigenVisita } from "@/tipos/visita";
import { ErrorApi } from "@/servicios/api";

import { SelectorCategoria } from "@/components/recorrido/SelectorCategoria";
import { SelectorLugar } from "@/components/recorrido/SelectorLugar";
import { CamaraVisita } from "@/components/recorrido/CamaraVisita";
import type { Categoria, Lugar } from "@/tipos/recorrido";

//FORMULARIO

export function FormularioVisita({
  metodo,
  token,
  onCancelar,
  lugarInicial,
}: {
  metodo: string;
  token: string;
  onCancelar: () => void;
  lugarInicial?: Lugar;
}) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState<Lugar | null>(
    null,
  );
  const [fechaHora, setFechaHora] = useState(new Date());
  const [nota, setNota] = useState("");
  const theme = useColorScheme() === "dark" ? Colors.dark : Colors.light;
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  // CATEGORIAS
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

  // PRECARGAR LUGAR DESDE QR
  useEffect(() => {
    if (!lugarInicial || categorias.length === 0) return;

    const categoria = categorias.find(
      (cat) => cat.id === lugarInicial.categoriaId,
    );

    if (!categoria) {
      alert("No se encontró la categoría del lugar.");
      return;
    }

    setCategoriaSeleccionada(categoria);
    setLugarSeleccionado(lugarInicial);
    setLugares([lugarInicial]);
  }, [lugarInicial, categorias]);

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

  // guardar la visita
  async function guardarVisita() {
    if (!lugarSeleccionado) {
      alert("Seleccioná un lugar antes de guardar la visita.");
      return;
    }

    try {
      const visita = await registrarVisita(
        token,
        lugarSeleccionado.id,
        metodo as OrigenVisita,
        nota.trim() || null,
        null,
      );

      console.log("Visita registrada:", visita);

      if (fotoUri) {
        const urlFoto = await subirFotografia(token, fotoUri);

        await actualizarFotoVisita(token, visita.id, urlFoto);

        console.log("Fotografía subida:", urlFoto);
      }

      onCancelar();
    } catch (error) {
      if (error instanceof ErrorApi) {
        console.error("Estado HTTP:", error.estado);
        console.error("Código:", error.codigo);
      } else {
        console.error("Error:", error);
      }

      alert("No se pudo registrar la visita.");
    }
  }

  return (
    <ScrollView>
      <ThemedView style={styles.contenedor}>
        <ThemedText type="title">Registrar Visita</ThemedText>

        {/*CAMPO CATEGORIA*/}

        <SelectorCategoria
          categorias={categorias}
          categoriaSeleccionada={categoriaSeleccionada}
          onSeleccionar={(categoria) => {
            setCategoriaSeleccionada(categoria);
            setLugarSeleccionado(null);
            setLugares([]);
          }}
        />

        {/*CAMPO LUGAR*/}

        <SelectorLugar
          lugares={lugares}
          lugarSeleccionado={lugarSeleccionado}
          categoriaSeleccionada={categoriaSeleccionada !== null}
          onSeleccionar={(lugar) => {
            setLugarSeleccionado(lugar);
          }}
        />

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

        {/*CAMPO CAMARA*/}

        <CamaraVisita
          fotoUri={fotoUri}
          onFotoTomada={(uri) => setFotoUri(uri)}
        />

        <Button title="Guardar Visita" onPress={guardarVisita} />

        <Button title="Cancelar y volver" onPress={onCancelar} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
