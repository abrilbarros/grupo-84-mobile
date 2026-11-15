import type { OrigenVisita } from "./visita";

export type Categoria = {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
};

export type DatosParaRegistrarVisita = {
  id: string;
  lugarId: string;
  origen: OrigenVisita;
  fechaHora: string;
  nota: string | null;
};

export type Lugar = {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
};