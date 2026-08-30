// src/app/servicios/producto.model.ts
export interface Producto {
  _id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenesUrl: string[];
  categoria: string;
  destacado?: boolean;
}