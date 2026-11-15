import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Categoria } from "@/tipos/categoria";
import {
  ALTURA_DE_LA_GALERIA_DE_IMAGENES,
  RADIO_DE_BORDE,
} from "../constantes/medidas";
import { obtenerNombreDeIconoDeCategoria } from "../utilidades/obtener-nombre-de-icono-de-categoria";

interface PropiedadesDeGaleriaDeImagenesDelLugar {
  direccionesDeImagenes: string[];
  categoria: Categoria | undefined;
}

export function GaleriaDeImagenesDelLugar({
  direccionesDeImagenes,
  categoria,
}: PropiedadesDeGaleriaDeImagenesDelLugar) {
  const colores = useTheme();
  const { width: anchoDeLaVentana } = useWindowDimensions();
  const anchoDeLaGaleria = Math.min(anchoDeLaVentana, MaxContentWidth);
  const [posicionActual, setPosicionActual] = useState(0);

  function actualizarPosicion(
    evento: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    setPosicionActual(
      Math.round(evento.nativeEvent.contentOffset.x / anchoDeLaGaleria),
    );
  }

  if (direccionesDeImagenes.length === 0) {
    return (
      <View
        style={[
          estilos.marco,
          estilos.sinImagenes,
          { width: anchoDeLaGaleria, backgroundColor: colores.secondary },
        ]}
      >
        <Ionicons
          name={obtenerNombreDeIconoDeCategoria(categoria)}
          size={72}
          color={colores.primary}
        />
      </View>
    );
  }

  return (
    <View style={[estilos.marco, { width: anchoDeLaGaleria }]}>
      <FlatList
        data={direccionesDeImagenes}
        keyExtractor={(direccion) => direccion}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={actualizarPosicion}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            contentFit="cover"
            style={{
              width: anchoDeLaGaleria,
              height: ALTURA_DE_LA_GALERIA_DE_IMAGENES,
              backgroundColor: colores.secondary,
            }}
          />
        )}
      />
      {direccionesDeImagenes.length > 1 && (
        <View
          style={[estilos.contador, { backgroundColor: colores.background }]}
        >
          <ThemedText type="smallBold">
            {posicionActual + 1} / {direccionesDeImagenes.length}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  marco: {
    height: ALTURA_DE_LA_GALERIA_DE_IMAGENES,
    alignSelf: "center",
  },
  sinImagenes: {
    alignItems: "center",
    justifyContent: "center",
  },
  contador: {
    position: "absolute",
    right: Spacing.three,
    bottom: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: RADIO_DE_BORDE.pequeno,
    opacity: 0.9,
  },
});
