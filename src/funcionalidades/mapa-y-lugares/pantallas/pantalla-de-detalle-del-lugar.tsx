import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { AvisoDeFavoritos } from "../componentes/aviso-de-favoritos";
import { AvisoSinConexion } from "../componentes/aviso-sin-conexion";
import { BotonDeAccion } from "../componentes/boton-de-accion";
import { BotonDeFavorito } from "../componentes/boton-de-favorito";
import { EtiquetaDeApertura } from "../componentes/etiqueta-de-apertura";
import { EtiquetaDeDistancia } from "../componentes/etiqueta-de-distancia";
import { FilaDeInformacion } from "../componentes/fila-de-informacion";
import { GaleriaDeImagenesDelLugar } from "../componentes/galeria-de-imagenes-del-lugar";
import { ListaDeHorarios } from "../componentes/lista-de-horarios";
import { MensajeDeEstado } from "../componentes/mensaje-de-estado";
import { ReproductorDeAudioguia } from "../componentes/reproductor-de-audioguia";
import { useCatalogoDeLugares } from "../hooks/use-catalogo-de-lugares";
import { useFavoritosDelUsuario } from "../hooks/use-favoritos-del-usuario";
import { useLugarPorIdentificador } from "../hooks/use-lugar-por-identificador";
import { useUbicacionDelUsuario } from "../hooks/use-ubicacion-del-usuario";
import { abrirAplicacionDeMapas } from "../utilidades/abrir-aplicacion-de-mapas";
import { abrirLlamadaTelefonica } from "../utilidades/abrir-llamada-telefonica";
import { abrirSitioWeb } from "../utilidades/abrir-sitio-web";
import { calcularDistanciaEnMetros } from "../utilidades/calcular-distancia-en-metros";
import { formatearPrecioDeEntrada } from "../utilidades/formatear-precio-de-entrada";
import { obtenerEstadoDeApertura } from "../utilidades/obtener-estado-de-apertura";

export function PantallaDeDetalleDelLugar() {
  const { id: identificadorDelLugar } = useLocalSearchParams<{ id: string }>();
  const colores = useTheme();
  const margenesSeguros = useSafeAreaInsets();
  const catalogo = useCatalogoDeLugares();
  const ubicacion = useUbicacionDelUsuario();
  const favoritos = useFavoritosDelUsuario();
  const { lugar, estaCargando, huboErrorSinCopiaGuardada } =
    useLugarPorIdentificador(identificadorDelLugar);

  const botonDeFavorito = lugar
    ? () => (
        <BotonDeFavorito
          esFavorito={favoritos.esFavorito(lugar.id)}
          estaDeshabilitado={favoritos.estaProcesando(lugar.id)}
          alPresionar={() => favoritos.alPresionarFavorito(lugar.id)}
        />
      )
    : undefined;

  const encabezado = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: lugar?.nombre ?? "Lugar",
        headerRight: botonDeFavorito,
      }}
    />
  );

  if (estaCargando) {
    return (
      <ThemedView style={estilos.pantallaCentrada}>
        {encabezado}
        <ActivityIndicator size="large" color={colores.primary} />
      </ThemedView>
    );
  }

  if (lugar === null) {
    return (
      <ThemedView style={estilos.pantallaCentrada}>
        {encabezado}
        <MensajeDeEstado
          nombreDelIcono={
            huboErrorSinCopiaGuardada ? "cloud-offline-outline" : "search-outline"
          }
          mensaje={
            huboErrorSinCopiaGuardada
              ? "No pudimos cargar este lugar. Revisá tu conexión y probá de nuevo."
              : "No encontramos este lugar. Puede que ya no esté disponible."
          }
        />
      </ThemedView>
    );
  }

  const categoria = catalogo.categoriasPorIdentificador[lugar.categoriaId];
  const ahora = new Date();
  const precioDeEntrada = formatearPrecioDeEntrada(lugar.precioEntrada);
  const distanciaEnMetros = ubicacion.coordenadas
    ? calcularDistanciaEnMetros(ubicacion.coordenadas, lugar.coordenadas)
    : null;

  return (
    <ThemedView style={estilos.pantalla}>
      {encabezado}
      <ScrollView
        contentContainerStyle={[
          estilos.contenido,
          { paddingBottom: Spacing.six + margenesSeguros.bottom },
        ]}
      >
        <GaleriaDeImagenesDelLugar
          direccionesDeImagenes={lugar.imagenes}
          categoria={categoria}
        />
        <View style={estilos.cuerpo}>
          {catalogo.estaSinConexion && <AvisoSinConexion />}
          {favoritos.huboError && <AvisoDeFavoritos />}
          {categoria && (
            <ThemedText type="smallBold" themeColor="primary">
              {categoria.nombre}
            </ThemedText>
          )}
          <ThemedText type="subtitle" style={estilos.nombre}>
            {lugar.nombre}
          </ThemedText>
          <EtiquetaDeApertura
            estadoDeApertura={obtenerEstadoDeApertura(lugar.horarios, ahora)}
          />
          <EtiquetaDeDistancia distanciaEnMetros={distanciaEnMetros} />
          <ThemedText themeColor="textContent">{lugar.descripcion}</ThemedText>
          {lugar.audioguia && (
            <ReproductorDeAudioguia audioguia={lugar.audioguia} />
          )}

          <View style={estilos.acciones}>
            <BotonDeAccion
              etiqueta="Cómo llegar"
              nombreDelIcono="navigate-outline"
              alPresionar={() => abrirAplicacionDeMapas(lugar.coordenadas)}
            />
          </View>

          <FilaDeInformacion
            nombreDelIcono="location-outline"
            etiqueta="Dirección"
            valor={lugar.direccion}
          />
          {lugar.telefono && (
            <FilaDeInformacion
              nombreDelIcono="call-outline"
              etiqueta="Teléfono"
              valor={lugar.telefono}
              alPresionar={() => abrirLlamadaTelefonica(lugar.telefono ?? "")}
            />
          )}
          {lugar.sitioWeb && (
            <FilaDeInformacion
              nombreDelIcono="globe-outline"
              etiqueta="Sitio web"
              valor={lugar.sitioWeb}
              alPresionar={() => abrirSitioWeb(lugar.sitioWeb ?? "")}
            />
          )}
          {precioDeEntrada && (
            <FilaDeInformacion
              nombreDelIcono="ticket-outline"
              etiqueta="Entrada"
              valor={precioDeEntrada}
            />
          )}
          <FilaDeInformacion
            nombreDelIcono="accessibility-outline"
            etiqueta="Accesibilidad"
            valor={
              lugar.accesible
                ? "Accesible para silla de ruedas"
                : "No es accesible para silla de ruedas"
            }
          />

          <ThemedText type="subtitle" style={estilos.tituloDeSeccion}>
            Horarios
          </ThemedText>
          <ListaDeHorarios horarios={lugar.horarios} diaActual={ahora.getDay()} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  pantallaCentrada: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contenido: {
    paddingBottom: Spacing.six,
  },
  cuerpo: {
    gap: Spacing.three,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    padding: Spacing.three,
  },
  nombre: {
    fontSize: 28,
    lineHeight: 36,
  },
  acciones: {
    flexDirection: "row",
  },
  tituloDeSeccion: {
    fontSize: 24,
    lineHeight: 32,
  },
});
