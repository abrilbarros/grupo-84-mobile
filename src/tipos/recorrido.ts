export type Categoria = {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
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