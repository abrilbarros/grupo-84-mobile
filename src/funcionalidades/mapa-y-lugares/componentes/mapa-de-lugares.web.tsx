import * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useImperativeHandle, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import type { Coordenadas } from "@/tipos/coordenadas";
import { COORDENADAS_DEL_CENTRO_DE_COLON } from "../constantes/centro-de-colon";
import {
  ATRIBUCION_DEL_MAPA,
  COLOR_DEL_BORDE_DE_LOS_PUNTOS,
  COLOR_DEL_PUNTO_DEL_USUARIO,
  DIRECCION_DE_LOS_MOSAICOS_DEL_MAPA,
  RADIO_DEL_MARCADOR_EN_PIXELES,
  RADIO_DEL_MARCADOR_SELECCIONADO_EN_PIXELES,
  RADIO_DEL_PUNTO_DEL_USUARIO_EN_PIXELES,
  ZOOM_DE_ENFOQUE_DEL_MAPA,
  ZOOM_INICIAL_DEL_MAPA,
  ZOOM_MAXIMO_DEL_MAPA,
} from "../constantes/configuracion-del-mapa-web";
import { estaCercaDeColon } from "../utilidades/esta-cerca-de-colon";
import type {
  ControladorDelMapa,
  PropiedadesDeMapaDeLugares,
} from "./mapa-de-lugares";

export type { ControladorDelMapa };

function convertirCoordenadasParaLeaflet(
  coordenadas: Coordenadas,
): Leaflet.LatLngTuple {
  return [coordenadas.latitud, coordenadas.longitud];
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
  const colores = useTheme();
  const contenedorDelMapa = useRef<HTMLDivElement>(null);
  const mapa = useRef<Leaflet.Map | null>(null);
  const yaSeCentroEnElUsuario = useRef(false);

  function centrarEn(coordenadas: Coordenadas) {
    mapa.current?.flyTo(
      convertirCoordenadasParaLeaflet(coordenadas),
      ZOOM_DE_ENFOQUE_DEL_MAPA,
    );
  }

  useImperativeHandle(controladorRef, () => ({ centrarEn }));

  useEffect(() => {
    if (contenedorDelMapa.current === null) return;
    const nuevoMapa = Leaflet.map(contenedorDelMapa.current, {
      zoomControl: false,
    }).setView(
      convertirCoordenadasParaLeaflet(COORDENADAS_DEL_CENTRO_DE_COLON),
      ZOOM_INICIAL_DEL_MAPA,
    );
    Leaflet.control.zoom({ position: "bottomright" }).addTo(nuevoMapa);
    Leaflet.tileLayer(DIRECCION_DE_LOS_MOSAICOS_DEL_MAPA, {
      attribution: ATRIBUCION_DEL_MAPA,
      maxZoom: ZOOM_MAXIMO_DEL_MAPA,
    }).addTo(nuevoMapa);
    mapa.current = nuevoMapa;
    return () => {
      nuevoMapa.remove();
      mapa.current = null;
    };
  }, []);

  useEffect(() => {
    const mapaActual = mapa.current;
    if (mapaActual === null) return;
    const grupoDeMarcadores = Leaflet.layerGroup().addTo(mapaActual);

    lugaresVisibles.forEach(({ lugar }) => {
      const estaSeleccionado = lugar.id === identificadorDelLugarSeleccionado;
      Leaflet.circleMarker(convertirCoordenadasParaLeaflet(lugar.coordenadas), {
        radius: estaSeleccionado
          ? RADIO_DEL_MARCADOR_SELECCIONADO_EN_PIXELES
          : RADIO_DEL_MARCADOR_EN_PIXELES,
        color: COLOR_DEL_BORDE_DE_LOS_PUNTOS,
        weight: estaSeleccionado ? 4 : 2,
        fillColor: categoriasPorIdentificador[lugar.categoriaId]?.color ?? colores.primary,
        fillOpacity: 1,
      })
        .bindTooltip(lugar.nombre)
        .on("click", (evento) => {
          Leaflet.DomEvent.stopPropagation(evento);
          alSeleccionarLugar(lugar.id);
        })
        .addTo(grupoDeMarcadores);
    });

    mapaActual.on("click", alDeseleccionarLugar);

    return () => {
      mapaActual.off("click", alDeseleccionarLugar);
      grupoDeMarcadores.remove();
    };
  }, [
    lugaresVisibles,
    categoriasPorIdentificador,
    identificadorDelLugarSeleccionado,
    alSeleccionarLugar,
    alDeseleccionarLugar,
    colores.primary,
  ]);

  useEffect(() => {
    const mapaActual = mapa.current;
    if (mapaActual === null || ubicacionDelUsuario === null) return;
    const puntoDelUsuario = Leaflet.circleMarker(
      convertirCoordenadasParaLeaflet(ubicacionDelUsuario),
      {
        radius: RADIO_DEL_PUNTO_DEL_USUARIO_EN_PIXELES,
        color: COLOR_DEL_BORDE_DE_LOS_PUNTOS,
        weight: 3,
        fillColor: COLOR_DEL_PUNTO_DEL_USUARIO,
        fillOpacity: 1,
      },
    )
      .bindTooltip("Estás acá")
      .addTo(mapaActual);
    return () => {
      puntoDelUsuario.remove();
    };
  }, [ubicacionDelUsuario]);

  useEffect(() => {
    if (ubicacionDelUsuario === null || yaSeCentroEnElUsuario.current) return;
    yaSeCentroEnElUsuario.current = true;
    if (estaCercaDeColon(ubicacionDelUsuario)) centrarEn(ubicacionDelUsuario);
  }, [ubicacionDelUsuario]);

  useEffect(() => {
    if (coordenadasDelLugarSeleccionado === null) return;
    centrarEn(coordenadasDelLugarSeleccionado);
  }, [coordenadasDelLugarSeleccionado]);

  return (
    <div
      ref={contenedorDelMapa}
      style={{ flex: 1, width: "100%", position: "relative", zIndex: 0 }}
    />
  );
}
