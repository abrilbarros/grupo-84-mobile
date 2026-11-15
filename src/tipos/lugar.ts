import type { Coordenadas } from "./coordenadas";

// Campos del contrato Lugar necesarios para la lista de favoritos.
export interface ResumenLugar {
  id: string;
  nombre: string;
  imagenes: string[];
  descripcionCorta: string;
}

export interface Horario {
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  abre: string;
  cierra: string;
}

export interface Audioguia {
  url: string;
  duracionSegundos: number;
  idioma: "es" | "en" | "pt";
}

export interface Lugar {
  id: string;
  nombre: string;
  categoriaId: string;
  descripcionCorta: string;
  descripcion: string;
  coordenadas: Coordenadas;
  direccion: string;
  imagenes: string[];
  horarios: Horario[];
  telefono: string | null;
  sitioWeb: string | null;
  precioEntrada: number | null;
  audioguia: Audioguia | null;
  codigoQr: string | null;
  accesible: boolean;
  activo: boolean;
  actualizadoEn: string;
}
