import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { AvisoDeFavoritos } from "../componentes/aviso-de-favoritos";
import { AvisoDeUbicacion } from "../componentes/aviso-de-ubicacion";
import { AvisoSinConexion } from "../componentes/aviso-sin-conexion";
import { BotonDeCentradoEnUbicacion } from "../componentes/boton-de-centrado-en-ubicacion";
import { EstadoDelCatalogo } from "../componentes/estado-del-catalogo";
import { FiltroDeCategorias } from "../componentes/filtro-de-categorias";
import { ListaDeLugaresCercanos } from "../componentes/lista-de-lugares-cercanos";
import {
  MapaDeLugares,
  type ControladorDelMapa,
} from "../componentes/mapa-de-lugares";
import { TarjetaDeLugarSeleccionado } from "../componentes/tarjeta-de-lugar-seleccionado";
import { useCatalogoDeLugares } from "../hooks/use-catalogo-de-lugares";
import { useFavoritosDelUsuario } from "../hooks/use-favoritos-del-usuario";
import { useFiltrosDeLugares } from "../hooks/use-filtros-de-lugares";
import { useUbicacionDelUsuario } from "../hooks/use-ubicacion-del-usuario";
import { abrirAplicacionDeMapas } from "../utilidades/abrir-aplicacion-de-mapas";
import { navegarAlDetalleDelLugar } from "../utilidades/navegar-al-detalle-del-lugar";
import { obtenerLugaresVisibles } from "../utilidades/obtener-lugares-visibles";

export function PantallaDelMapa() {
  const catalogo = useCatalogoDeLugares();
  const ubicacion = useUbicacionDelUsuario();
  const filtros = useFiltrosDeLugares();
  const favoritos = useFavoritosDelUsuario();
  const controladorDelMapa = useRef<ControladorDelMapa>(null);
  const [identificadorDelLugarSeleccionado, setIdentificadorDelLugarSeleccionado] =
    useState<string | null>(null);

  const lugaresVisibles = obtenerLugaresVisibles({
    lugares: catalogo.lugares,
    identificadoresDeCategoriasSeleccionadas:
      filtros.identificadoresDeCategoriasSeleccionadas,
    textoDeBusqueda: "",
    ubicacionDelUsuario: ubicacion.coordenadas,
    orden: "distancia",
  });

  const lugarSeleccionado =
    lugaresVisibles.find(
      ({ lugar }) => lugar.id === identificadorDelLugarSeleccionado,
    ) ?? null;

  const tituloDeLaLista = ubicacion.coordenadas
    ? "Cerca tuyo"
    : "Lugares para visitar";

  return (
    <ThemedView style={estilos.pantalla}>
      <View style={estilos.seccionDelMapa}>
        <MapaDeLugares
          lugaresVisibles={lugaresVisibles}
          categoriasPorIdentificador={catalogo.categoriasPorIdentificador}
          ubicacionDelUsuario={ubicacion.coordenadas}
          coordenadasDelLugarSeleccionado={
            lugarSeleccionado?.lugar.coordenadas ?? null
          }
          identificadorDelLugarSeleccionado={identificadorDelLugarSeleccionado}
          alSeleccionarLugar={setIdentificadorDelLugarSeleccionado}
          alDeseleccionarLugar={() => setIdentificadorDelLugarSeleccionado(null)}
          controladorRef={controladorDelMapa}
        />
        <View style={estilos.controlesSuperiores} pointerEvents="box-none">
          <FiltroDeCategorias
            categorias={catalogo.categorias}
            identificadoresDeCategoriasSeleccionadas={
              filtros.identificadoresDeCategoriasSeleccionadas
            }
            alAlternarCategoria={filtros.alternarCategoria}
            alMostrarTodasLasCategorias={filtros.mostrarTodasLasCategorias}
          />
          {ubicacion.coordenadas && (
            <View style={estilos.botonDeCentrado}>
              <BotonDeCentradoEnUbicacion
                alPresionar={() =>
                  ubicacion.coordenadas &&
                  controladorDelMapa.current?.centrarEn(ubicacion.coordenadas)
                }
              />
            </View>
          )}
        </View>
        {lugarSeleccionado && (
          <View style={estilos.tarjetaSeleccionada}>
            <TarjetaDeLugarSeleccionado
              lugarConDistancia={lugarSeleccionado}
              categoria={
                catalogo.categoriasPorIdentificador[
                  lugarSeleccionado.lugar.categoriaId
                ]
              }
              ubicacionDelUsuario={ubicacion.coordenadas}
              controlDeFavoritos={favoritos}
              alVerDetalle={navegarAlDetalleDelLugar}
              alPedirComoLlegar={abrirAplicacionDeMapas}
              alCerrar={() => setIdentificadorDelLugarSeleccionado(null)}
            />
          </View>
        )}
      </View>

      <View style={estilos.seccionDeLaLista}>
        <EstadoDelCatalogo
          estaCargando={catalogo.estaCargando}
          huboError={catalogo.huboErrorSinCopiaGuardada}
          alReintentar={catalogo.actualizarCatalogo}
        >
          <ListaDeLugaresCercanos
            titulo={tituloDeLaLista}
            lugaresConDistancia={lugaresVisibles}
            categoriasPorIdentificador={catalogo.categoriasPorIdentificador}
            controlDeFavoritos={favoritos}
            avisos={
              <>
                {catalogo.estaSinConexion && <AvisoSinConexion />}
                {favoritos.huboError && <AvisoDeFavoritos />}
                <AvisoDeUbicacion
                  estadoDelPermiso={ubicacion.estadoDelPermiso}
                  alSolicitarUbicacion={ubicacion.solicitarUbicacionNuevamente}
                />
              </>
            }
            alPresionarLugar={navegarAlDetalleDelLugar}
            alVerTodosLosLugares={() => router.push("/lugares")}
          />
        </EstadoDelCatalogo>
      </View>
    </ThemedView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  seccionDelMapa: {
    flex: 1.2,
  },
  seccionDeLaLista: {
    flex: 1,
  },
  controlesSuperiores: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  botonDeCentrado: {
    alignItems: "flex-end",
    paddingHorizontal: Spacing.three,
  },
  tarjetaSeleccionada: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.three,
  },
});
