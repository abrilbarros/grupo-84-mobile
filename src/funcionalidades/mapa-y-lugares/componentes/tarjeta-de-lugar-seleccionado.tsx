import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Categoria } from "@/tipos/categoria";
import type { Coordenadas } from "@/tipos/coordenadas";
import { ALTURA_MINIMA_DE_TOQUE, RADIO_DE_BORDE } from "../constantes/medidas";
import type { LugarConDistancia } from "../modelos/lugar-con-distancia";
import { BotonDeAccion } from "./boton-de-accion";
import { EtiquetaDeDistancia } from "./etiqueta-de-distancia";
import { FlechaHaciaElLugar } from "./flecha-hacia-el-lugar";

interface PropiedadesDeTarjetaDeLugarSeleccionado {
  lugarConDistancia: LugarConDistancia;
  categoria: Categoria | undefined;
  ubicacionDelUsuario: Coordenadas | null;
  alVerDetalle: (identificadorDelLugar: string) => void;
  alPedirComoLlegar: (destino: Coordenadas) => void;
  alCerrar: () => void;
}

export function TarjetaDeLugarSeleccionado({
  lugarConDistancia,
  categoria,
  ubicacionDelUsuario,
  alVerDetalle,
  alPedirComoLlegar,
  alCerrar,
}: PropiedadesDeTarjetaDeLugarSeleccionado) {
  const colores = useTheme();
  const { lugar, distanciaEnMetros } = lugarConDistancia;

  return (
    <View
      style={[
        estilos.tarjeta,
        { backgroundColor: colores.background, borderColor: colores.primary },
      ]}
    >
      <View style={estilos.encabezado}>
        <View style={estilos.titulos}>
          <ThemedText
            numberOfLines={2}
            style={[estilos.nombre, { color: colores.textContent }]}
          >
            {lugar.nombre}
          </ThemedText>
          {categoria && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {categoria.nombre}
            </ThemedText>
          )}
          <EtiquetaDeDistancia distanciaEnMetros={distanciaEnMetros} />
        </View>
        <Pressable
          onPress={alCerrar}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={estilos.botonDeCierre}
        >
          <Ionicons name="close" size={28} color={colores.textContent} />
        </Pressable>
      </View>
      <FlechaHaciaElLugar
        ubicacionDelUsuario={ubicacionDelUsuario}
        destino={lugar.coordenadas}
      />
      <View style={estilos.acciones}>
        <BotonDeAccion
          etiqueta="Ver detalle"
          nombreDelIcono="information-circle-outline"
          alPresionar={() => alVerDetalle(lugar.id)}
        />
        <BotonDeAccion
          etiqueta="Cómo llegar"
          nombreDelIcono="navigate-outline"
          variante="secundario"
          alPresionar={() => alPedirComoLlegar(lugar.coordenadas)}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: RADIO_DE_BORDE.grande,
    elevation: 6,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  titulos: {
    flex: 1,
    gap: Spacing.one,
  },
  nombre: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },
  botonDeCierre: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: ALTURA_MINIMA_DE_TOQUE,
    minHeight: ALTURA_MINIMA_DE_TOQUE,
  },
  acciones: {
    flexDirection: "row",
    gap: Spacing.two,
  },
});
