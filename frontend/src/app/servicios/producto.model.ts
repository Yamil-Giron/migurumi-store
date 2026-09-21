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

// NUEVO
export interface Variante {
  _id?: string;
  color: string;
  medida: string;
  stock: number;
  precioExtra?: number;
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
  variantes?: Variante[];   // ← NUEVO
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

export interface Categoria {
  _id?: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagenPortada?: string;
  activa?: boolean;
  orden?: number;
  metaDescripcion?: string;
  palabrasClaveMetatag?: string[];
  fechaCreacion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RespuestaCategorias {
  total: number;
  categorias: Categoria[];
}