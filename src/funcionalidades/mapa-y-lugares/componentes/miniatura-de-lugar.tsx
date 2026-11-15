import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import type { Categoria } from "@/tipos/categoria";
import { RADIO_DE_BORDE } from "../constantes/medidas";
import { obtenerNombreDeIconoDeCategoria } from "../utilidades/obtener-nombre-de-icono-de-categoria";

const LADO_DE_LA_MINIATURA = 80;

interface PropiedadesDeMiniaturaDeLugar {
  direccionDeLaImagen: string | null;
  categoria: Categoria | undefined;
}

export function MiniaturaDeLugar({
  direccionDeLaImagen,
  categoria,
}: PropiedadesDeMiniaturaDeLugar) {
  const colores = useTheme();
  const [fallaLaImagen, setFallaLaImagen] = useState(false);

  if (direccionDeLaImagen && !fallaLaImagen) {
    return (
      <Image
        source={{ uri: direccionDeLaImagen }}
        style={estilos.miniatura}
        contentFit="cover"
        onError={() => setFallaLaImagen(true)}
      />
    );
  }

  return (
    <View
      style={[
        estilos.miniatura,
        estilos.sinImagen,
        { backgroundColor: colores.secondary },
      ]}
    >
      <Ionicons
        name={obtenerNombreDeIconoDeCategoria(categoria)}
        size={36}
        color={colores.primary}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  miniatura: {
    width: LADO_DE_LA_MINIATURA,
    height: LADO_DE_LA_MINIATURA,
    borderRadius: RADIO_DE_BORDE.mediano,
  },
  sinImagen: {
    alignItems: "center",
    justifyContent: "center",
  },
});
