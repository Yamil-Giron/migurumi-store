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