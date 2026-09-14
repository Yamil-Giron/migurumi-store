export interface CategoriaResumen {
  _id: string;
  nombre: string;
  slug: string;
}

export interface Especificaciones {
  altura?: string;
  material?: string;
  tiempoElaboracion?: string;
  colores?: string[];
}

export interface Producto {
  _id?: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  categoriaId: string | CategoriaResumen;
  precio: number;
  precioOriginal?: number;
  descuento?: number;
  stock: number;
  imagenesUrl?: string[];
  especificaciones?: Especificaciones;
  activo?: boolean;
  destacado?: boolean;
  vendedor?: string;
  calificacionPromedio?: number;
  numeroResenas?: number;
  ventasTotales?: number;
  fechaCreacion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RespuestaProductos {
  total: number;
  productos: Producto[];
}