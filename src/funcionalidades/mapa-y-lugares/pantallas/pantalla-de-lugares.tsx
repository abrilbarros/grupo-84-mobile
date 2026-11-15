import { Stack } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { AvisoDeFavoritos } from "../componentes/aviso-de-favoritos";
import { AvisoDeUbicacion } from "../componentes/aviso-de-ubicacion";
import { AvisoSinConexion } from "../componentes/aviso-sin-conexion";
import { CampoDeBusqueda } from "../componentes/campo-de-busqueda";
import { EstadoDelCatalogo } from "../componentes/estado-del-catalogo";
import { FiltroDeCategorias } from "../componentes/filtro-de-categorias";
import { MensajeDeEstado } from "../componentes/mensaje-de-estado";
import { SelectorDeOrden } from "../componentes/selector-de-orden";
import { TarjetaDeLugar } from "../componentes/tarjeta-de-lugar";
import { useCatalogoDeLugares } from "../hooks/use-catalogo-de-lugares";
import { useFavoritosDelUsuario } from "../hooks/use-favoritos-del-usuario";
import { useFiltrosDeLugares } from "../hooks/use-filtros-de-lugares";
import { useUbicacionDelUsuario } from "../hooks/use-ubicacion-del-usuario";
import type { OrdenDeLugares } from "../modelos/orden-de-lugares";
import { navegarAlDetalleDelLugar } from "../utilidades/navegar-al-detalle-del-lugar";
import { obtenerLugaresVisibles } from "../utilidades/obtener-lugares-visibles";

export function PantallaDeLugares() {
  const catalogo = useCatalogoDeLugares();
  const ubicacion = useUbicacionDelUsuario();
  const filtros = useFiltrosDeLugares();
  const favoritos = useFavoritosDelUsuario();
  const [ordenElegido, setOrdenElegido] = useState<OrdenDeLugares>("distancia");

  const puedeOrdenarPorDistancia = ubicacion.coordenadas !== null;
  const ordenAplicado: OrdenDeLugares = puedeOrdenarPorDistancia
    ? ordenElegido
    : "nombre";

  const lugaresVisibles = obtenerLugaresVisibles({
    lugares: catalogo.lugares,
    identificadoresDeCategoriasSeleccionadas:
      filtros.identificadoresDeCategoriasSeleccionadas,
    textoDeBusqueda: filtros.textoDeBusqueda,
    ubicacionDelUsuario: ubicacion.coordenadas,
    orden: ordenAplicado,
  });

  return (
    <ThemedView style={estilos.pantalla}>
      <Stack.Screen options={{ headerShown: true, title: "Todos los lugares" }} />
      <View style={estilos.controles}>
        <CampoDeBusqueda
          valor={filtros.textoDeBusqueda}
          alCambiarValor={filtros.cambiarTextoDeBusqueda}
        />
        <SelectorDeOrden
          ordenSeleccionado={ordenAplicado}
          puedeOrdenarPorDistancia={puedeOrdenarPorDistancia}
          alCambiarOrden={setOrdenElegido}
        />
      </View>
      <FiltroDeCategorias
        categorias={catalogo.categorias}
        identificadoresDeCategoriasSeleccionadas={
          filtros.identificadoresDeCategoriasSeleccionadas
        }
        alAlternarCategoria={filtros.alternarCategoria}
        alMostrarTodasLasCategorias={filtros.mostrarTodasLasCategorias}
      />
      <EstadoDelCatalogo
        estaCargando={catalogo.estaCargando}
        huboError={catalogo.huboErrorSinCopiaGuardada}
        alReintentar={catalogo.actualizarCatalogo}
      >
        <FlatList
          data={lugaresVisibles}
          keyExtractor={(elemento) => elemento.lugar.id}
          contentContainerStyle={estilos.lista}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={estilos.avisos}>
              {catalogo.estaSinConexion && <AvisoSinConexion />}
              {favoritos.huboError && <AvisoDeFavoritos />}
              <AvisoDeUbicacion
                estadoDelPermiso={ubicacion.estadoDelPermiso}
                alSolicitarUbicacion={ubicacion.solicitarUbicacionNuevamente}
              />
            </View>
          }
          ListEmptyComponent={
            <MensajeDeEstado
              nombreDelIcono="search-outline"
              mensaje="No encontramos lugares con esa búsqueda. Probá con otro nombre o con otra categoría."
            />
          }
          renderItem={({ item }) => (
            <TarjetaDeLugar
              lugarConDistancia={item}
              categoria={catalogo.categoriasPorIdentificador[item.lugar.categoriaId]}
              controlDeFavoritos={favoritos}
              alPresionar={navegarAlDetalleDelLugar}
            />
          )}
        />
      </EstadoDelCatalogo>
    </ThemedView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  controles: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  lista: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  avisos: {
    gap: Spacing.three,
  },
});
