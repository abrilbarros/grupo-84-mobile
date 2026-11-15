export type Categoria = {
  id: string;
  nombre: string;
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