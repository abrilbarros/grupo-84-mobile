import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { StyleSheet } from "react-native";
import MapView from "react-native-maps";
import type { Categoria } from "@/tipos/categoria";
import type { Coordenadas } from "@/tipos/coordenadas";
import {
  COORDENADAS_DEL_CENTRO_DE_COLON,
  DELTA_DE_ENFOQUE_CERCANO,
  DELTA_DE_ZONA_URBANA,
} from "../constantes/centro-de-colon";
import type { LugarConDistancia } from "../modelos/lugar-con-distancia";
import { convertirCoordenadasParaElMapa } from "../utilidades/convertir-coordenadas-para-el-mapa";
import { MarcadorDeLugar } from "./marcador-de-lugar";

const DURACION_DEL_DESPLAZAMIENTO_EN_MILISEGUNDOS = 500;

export interface ControladorDelMapa {
  centrarEn: (coordenadas: Coordenadas) => void;
}

export interface PropiedadesDeMapaDeLugares {
  lugaresVisibles: LugarConDistancia[];
  categoriasPorIdentificador: Record<string, Categoria>;
  ubicacionDelUsuario: Coordenadas | null;
  coordenadasDelLugarSeleccionado: Coordenadas | null;
  identificadorDelLugarSeleccionado: string | null;
  alSeleccionarLugar: (identificadorDelLugar: string) => void;
  alDeseleccionarLugar: () => void;
  controladorRef: Ref<ControladorDelMapa>;
}

export function MapaDeLugares({
  lugaresVisibles,
  categoriasPorIdentificador,
  ubicacionDelUsuario,
  coordenadasDelLugarSeleccionado,
  identificadorDelLugarSeleccionado,
  alSeleccionarLugar,
  alDeseleccionarLugar,
  controladorRef,
}: PropiedadesDeMapaDeLugares) {
  const referenciaDelMapa = useRef<MapView>(null);
  const yaSeCentroEnElUsuario = useRef(false);

  function centrarEn(coordenadas: Coordenadas) {
    referenciaDelMapa.current?.animateToRegion(
      {
        ...convertirCoordenadasParaElMapa(coordenadas),
        latitudeDelta: DELTA_DE_ENFOQUE_CERCANO,
        longitudeDelta: DELTA_DE_ENFOQUE_CERCANO,
      },
      DURACION_DEL_DESPLAZAMIENTO_EN_MILISEGUNDOS,
    );
  }

  useImperativeHandle(controladorRef, () => ({ centrarEn }));

  useEffect(() => {
    if (ubicacionDelUsuario === null || yaSeCentroEnElUsuario.current) return;
    yaSeCentroEnElUsuario.current = true;
    centrarEn(ubicacionDelUsuario);
  }, [ubicacionDelUsuario]);

  useEffect(() => {
    if (coordenadasDelLugarSeleccionado === null) return;
    centrarEn(coordenadasDelLugarSeleccionado);
  }, [coordenadasDelLugarSeleccionado]);

  return (
    <MapView
      ref={referenciaDelMapa}
      style={estilos.mapa}
      initialRegion={{
        ...convertirCoordenadasParaElMapa(COORDENADAS_DEL_CENTRO_DE_COLON),
        latitudeDelta: DELTA_DE_ZONA_URBANA,
        longitudeDelta: DELTA_DE_ZONA_URBANA,
      }}
      showsUserLocation={ubicacionDelUsuario !== null}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      onPress={alDeseleccionarLugar}
    >
      {lugaresVisibles.map(({ lugar }) => (
        <MarcadorDeLugar
          key={lugar.id}
          lugar={lugar}
          categoria={categoriasPorIdentificador[lugar.categoriaId]}
          estaSeleccionado={lugar.id === identificadorDelLugarSeleccionado}
          alPresionar={alSeleccionarLugar}
        />
      ))}
    </MapView>
  );
}

const estilos = StyleSheet.create({
  mapa: {
    flex: 1,
  },
});
