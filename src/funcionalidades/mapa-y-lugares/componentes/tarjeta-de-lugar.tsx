import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Categoria } from "@/tipos/categoria";
import { RADIO_DE_BORDE } from "../constantes/medidas";
import type { ControlDeFavoritos } from "../modelos/control-de-favoritos";
import type { LugarConDistancia } from "../modelos/lugar-con-distancia";
import { BotonDeFavorito } from "./boton-de-favorito";
import { EtiquetaDeDistancia } from "./etiqueta-de-distancia";
import { MiniaturaDeLugar } from "./miniatura-de-lugar";

interface PropiedadesDeTarjetaDeLugar {
  lugarConDistancia: LugarConDistancia;
  categoria: Categoria | undefined;
  controlDeFavoritos: ControlDeFavoritos;
  alPresionar: (identificadorDelLugar: string) => void;
}

export function TarjetaDeLugar({
  lugarConDistancia,
  categoria,
  controlDeFavoritos,
  alPresionar,
}: PropiedadesDeTarjetaDeLugar) {
  const colores = useTheme();
  const { lugar, distanciaEnMetros } = lugarConDistancia;

  return (
    <View style={[estilos.tarjeta, { borderColor: colores.primary }]}>
      <Pressable
        onPress={() => alPresionar(lugar.id)}
        accessibilityRole="button"
        accessibilityLabel={`Ver ${lugar.nombre}`}
        style={estilos.contenidoPresionable}
      >
        <MiniaturaDeLugar
          direccionDeLaImagen={lugar.imagenes[0] ?? null}
          categoria={categoria}
        />
        <View style={estilos.informacion}>
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
          <ThemedText type="small" themeColor="textContent" numberOfLines={2}>
            {lugar.descripcionCorta}
          </ThemedText>
          <EtiquetaDeDistancia distanciaEnMetros={distanciaEnMetros} />
        </View>
      </Pressable>
      <BotonDeFavorito
        esFavorito={controlDeFavoritos.esFavorito(lugar.id)}
        estaDeshabilitado={controlDeFavoritos.estaProcesando(lugar.id)}
        alPresionar={() => controlDeFavoritos.alPresionarFavorito(lugar.id)}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: RADIO_DE_BORDE.grande,
  },
  contenidoPresionable: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.three,
  },
  informacion: {
    flex: 1,
    gap: Spacing.one,
  },
  nombre: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
});
