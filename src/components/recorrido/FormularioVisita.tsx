
import { useState, useEffect } from "react";
import {
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

import { obtenerCategorias, obtenerLugares } from "@/servicios/recorrido";
import { guardarVisitaEnElTelefono } from "@/funcionalidades/mi-recorrido/servicios/registro-de-visitas-en-el-telefono";

import { OrigenVisita } from "@/tipos/visita";

import { SelectorCategoria } from "@/components/recorrido/SelectorCategoria";
import { SelectorLugar } from "@/components/recorrido/SelectorLugar";
import { CamaraVisita } from "@/components/recorrido/CamaraVisita";
import { BotonRecorrido } from "@/components/ui/botones-recorrido";

import type { Categoria, Lugar } from "@/tipos/recorrido";

export function FormularioVisita({
  metodo,
  usuarioId,
  onCancelar,
  lugarInicial,
}: {
  metodo: string;
  usuarioId: string;
  onCancelar: () => void;
  lugarInicial?: Lugar;
}) {
  const colores = useTheme();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [lugarSeleccionado, setLugarSeleccionado] =
    useState<Lugar | null>(null);
  const [fechaHora, setFechaHora] = useState(new Date());
  const [nota, setNota] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [cargandoLugares, setCargandoLugares] = useState(false);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [guardandoVisita, setGuardandoVisita] = useState(false);

  useEffect(() => {
    async function cargarCategorias() {
      try {
        setCargandoCategorias(true);

        const datos = await obtenerCategorias();
        setCategorias(datos);

        // Precarga el catálogo completo para que el selector por categoría
        // pueda funcionar sin conexión, incluso antes de elegir una categoría.
        try {
          await obtenerLugares();
        } catch (error) {
          console.error("Error al precargar los lugares para uso sin conexión:", error);
        }
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
        setCategorias([]);
      } finally {
        setCargandoCategorias(false);
      }
    }

    cargarCategorias();
  }, []);

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

  useEffect(() => {
    async function cargarLugares() {
      if (!categoriaSeleccionada) {
        setLugares([]);
        return;
      }

      try {
        setCargandoLugares(true);

        const datos = await obtenerLugares(categoriaSeleccionada.id);
        setLugares(datos);
      } catch (error) {
        console.error("Error al cargar los lugares:", error);
        setLugares([]);
      } finally {
        setCargandoLugares(false);
      }
    }

    cargarLugares();
  }, [categoriaSeleccionada]);

  async function guardarVisita() {
    if (guardandoVisita) return;

    if (!lugarSeleccionado) {
      alert("Seleccioná un lugar antes de guardar la visita.");
      return;
    }

    setGuardandoVisita(true);

    try {
      await guardarVisitaEnElTelefono({
        usuarioId,
        lugarId: lugarSeleccionado.id,
        origen: metodo as OrigenVisita,
        nota: nota.trim() || null,
        direccionTemporalDeLaFotografia: fotoUri,
      });

      onCancelar();
    } catch (error) {
      console.error("Error al guardar la visita en el teléfono:", error);

      alert("No pudimos guardar la visita en tu teléfono. Probá de nuevo.");
    } finally {
      setGuardandoVisita(false);
    }
  }

  return (
    <>
      <Modal
        visible={guardandoVisita}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <ThemedView style={styles.fondoCarga}>
          <ThemedView
            style={[
              styles.tarjetaCarga,
              { backgroundColor: colores.backgroundElement },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={colores.primary}
            />

            <ThemedText type="subtitle">
              Guardando tu visita...
            </ThemedText>

            <ThemedText
              style={{ color: colores.textSecondary }}
            >
              Por favor, esperá un momento.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </Modal>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contenidoScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView
          style={[
            styles.contenedor,
            { backgroundColor: colores.background },
          ]}
        >
          <ThemedView
            style={[styles.encabezado, styles.contenedorInterno]}
          >
            <ThemedView
              style={[
                styles.iconoEncabezado,
                { backgroundColor: colores.secondary },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={28}
                color={colores.primary}
              />
            </ThemedView>

            <ThemedText type="title">
              Registrar visita
            </ThemedText>

            <ThemedText
              style={[
                styles.subtitulo,
                { color: colores.textSecondary },
              ]}
            >
              Completá los datos para guardar tu experiencia.
            </ThemedText>
          </ThemedView>

          <ThemedView
            style={[
              styles.tarjeta,
              {
                backgroundColor: colores.backgroundElement,
                borderColor: colores.backgroundSelected,
              },
            ]}
          >
            <ThemedText type="subtitle">
              Información del lugar
            </ThemedText>

            <ThemedView
              style={[styles.campo, styles.contenedorInterno]}
            >
              <ThemedText type="smallBold">
                Categoría
              </ThemedText>

              <SelectorCategoria
                categorias={categorias}
                categoriaSeleccionada={categoriaSeleccionada}
                cargando={cargandoCategorias}
                onSeleccionar={(categoria) => {
                  setCategoriaSeleccionada(categoria);
                  setLugarSeleccionado(null);
                  setLugares([]);
                }}
              />
            </ThemedView>

            <ThemedView
              style={[styles.campo, styles.contenedorInterno]}
            >
              <ThemedText type="smallBold">
                Lugar
              </ThemedText>

              <SelectorLugar
                lugares={lugares}
                lugarSeleccionado={lugarSeleccionado}
                categoriaSeleccionada={categoriaSeleccionada !== null}
                cargando={cargandoLugares}
                onSeleccionar={(lugar) => {
                  setLugarSeleccionado(lugar);
                }}
              />
            </ThemedView>

            <ThemedView
              style={[
                styles.informacion,
                { backgroundColor: colores.backgroundSelected },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colores.primary}
              />

              <ThemedView
                style={[
                  styles.textoInformacion,
                  styles.contenedorInterno,
                ]}
              >
                <ThemedText type="smallBold">
                  Descripción
                </ThemedText>

                <ThemedText
                  style={{ color: colores.textSecondary }}
                >
                  {lugarSeleccionado
                    ? lugarSeleccionado.descripcion
                    : "La descripción del lugar aparecerá cuando lo selecciones."}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={[
              styles.tarjeta,
              {
                backgroundColor: colores.backgroundElement,
                borderColor: colores.backgroundSelected,
              },
            ]}
          >
            <ThemedText type="subtitle">
              Detalles de la visita
            </ThemedText>

            <ThemedView
              style={[
                styles.fecha,
                { backgroundColor: colores.backgroundSelected },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={21}
                color={colores.primary}
              />

              <ThemedView
                style={[
                  styles.textoFecha,
                  styles.contenedorInterno,
                ]}
              >
                <ThemedText type="smallBold">
                  Fecha y hora
                </ThemedText>

                <ThemedText
                  style={{ color: colores.textSecondary }}
                >
                  {fechaHora.toLocaleString("es-AR")}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView
              style={[styles.campo, styles.contenedorInterno]}
            >
              <ThemedText type="smallBold">
                Tu experiencia
              </ThemedText>

              <TextInput
                style={[
                  styles.inputNota,
                  {
                    color: colores.text,
                    backgroundColor: colores.background,
                    borderColor: colores.backgroundSelected,
                  },
                ]}
                placeholder="Dejá una nota sobre tu visita (opcional)"
                placeholderTextColor={colores.textSecondary}
                value={nota}
                onChangeText={setNota}
                multiline
                textAlignVertical="top"
              />
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={[
              styles.tarjeta,
              {
                backgroundColor: colores.backgroundElement,
                borderColor: colores.backgroundSelected,
              },
            ]}
          >
            <ThemedText type="subtitle">
              Fotografía
            </ThemedText>

            <ThemedText
              style={[
                styles.subtituloFoto,
                { color: colores.textSecondary },
              ]}
            >
              Podés adjuntar una foto para recordar este momento.
            </ThemedText>

            <CamaraVisita
              fotoUri={fotoUri}
              onFotoTomada={(uri) => setFotoUri(uri)}
            />
          </ThemedView>

          <ThemedView
            style={[styles.botones, styles.contenedorInterno]}
          >
            <BotonRecorrido
              titulo={
                guardandoVisita
                  ? "Guardando visita..."
                  : "Guardar visita"
              }
              icono="checkmark-circle-outline"
              onPress={guardarVisita}
              disabled={guardandoVisita}
            />

            <BotonRecorrido
              titulo="Cancelar y volver"
              icono="arrow-back-outline"
              variante="contorno"
              onPress={onCancelar}
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  fondoCarga: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  tarjetaCarga: {
    width: "100%",
    maxWidth: 320,
    padding: Spacing.four,
    borderRadius: 18,
    alignItems: "center",
    gap: Spacing.three,
  },
  contenidoScroll: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  contenedor: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  contenedorInterno: {
    backgroundColor: "transparent",
  },
  encabezado: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  iconoEncabezado: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: "center",
  },
  tarjeta: {
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  campo: {
    gap: Spacing.two,
  },
  informacion: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
  },
  textoInformacion: {
    flex: 1,
    gap: Spacing.one,
  },
  fecha: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
  },
  textoFecha: {
    flex: 1,
    gap: Spacing.one,
  },
  inputNota: {
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    fontSize: 15,
  },
  subtituloFoto: {
    fontSize: 14,
  },
  botones: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
});
