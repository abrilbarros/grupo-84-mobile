export interface ControlDeFavoritos {
  esFavorito: (identificadorDelLugar: string) => boolean;
  estaOcupado: boolean;
  alPresionarFavorito: (identificadorDelLugar: string) => void;
}
