import { Marker } from "react-native-maps";
import { useTheme } from "@/hooks/use-theme";
import type { Categoria } from "@/tipos/categoria";
import type { Lugar } from "@/tipos/lugar";
import { convertirCoordenadasParaElMapa } from "../utilidades/convertir-coordenadas-para-el-mapa";

interface PropiedadesDeMarcadorDeLugar {
  lugar: Lugar;
  categoria: Categoria | undefined;
  estaSeleccionado: boolean;
  alPresionar: (identificadorDelLugar: string) => void;
}

export function MarcadorDeLugar({
  lugar,
  categoria,
  estaSeleccionado,
  alPresionar,
}: PropiedadesDeMarcadorDeLugar) {
  const colores = useTheme();

  return (
    <Marker
      coordinate={convertirCoordenadasParaElMapa(lugar.coordenadas)}
      pinColor={categoria?.color ?? colores.primary}
      zIndex={estaSeleccionado ? 1 : 0}
      accessibilityLabel={lugar.nombre}
      onPress={(evento) => {
        evento.stopPropagation();
        alPresionar(lugar.id);
      }}
    />
  );
}
