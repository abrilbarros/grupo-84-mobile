import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { MensajeDeEstado } from "./mensaje-de-estado";

interface PropiedadesDeEstadoDelCatalogo {
  estaCargando: boolean;
  huboError: boolean;
  alReintentar: () => void;
  children: ReactNode;
}

export function EstadoDelCatalogo({
  estaCargando,
  huboError,
  alReintentar,
  children,
}: PropiedadesDeEstadoDelCatalogo) {
  const colores = useTheme();

  if (estaCargando) {
    return (
      <ActivityIndicator
        size="large"
        color={colores.primary}
        style={estilos.indicador}
      />
    );
  }

  if (huboError) {
    return (
      <MensajeDeEstado
        nombreDelIcono="cloud-offline-outline"
        mensaje="No pudimos cargar los lugares. Revisá tu conexión y probá de nuevo."
        etiquetaDeLaAccion="Reintentar"
        alPresionarLaAccion={alReintentar}
      />
    );
  }

  return <>{children}</>;
}

const estilos = StyleSheet.create({
  indicador: {
    marginTop: Spacing.five,
  },
});
