export interface Resena {
  _id?: string;
  productoId: string;
  usuarioId?: string;
  usuarioNombre?: string;
  calificacion: number;
  titulo?: string;
  comentario: string;
  createdAt?: string;
}