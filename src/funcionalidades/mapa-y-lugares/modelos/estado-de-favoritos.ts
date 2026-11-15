export interface EstadoDeFavoritos {
  identificadoresDeLugaresFavoritos: string[];
  identificadoresDeLugaresEnProceso: string[];
  estaCargando: boolean;
  huboError: boolean;
}
