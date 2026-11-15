export interface ControlDeFavoritos {
  esFavorito: (identificadorDelLugar: string) => boolean;
  estaProcesando: (identificadorDelLugar: string) => boolean;
  alPresionarFavorito: (identificadorDelLugar: string) => void;
}
