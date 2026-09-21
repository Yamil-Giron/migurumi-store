export interface ItemPedido {
  productoId: string;
  varianteId?: string | null;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

export interface Pedido {
  _id?: string;
  numeroPedido?: string;
  usuarioId?: string;
  clienteNombre?: string;
  clienteEmail?: string;
  items: ItemPedido[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  estado?: string;
  createdAt?: string;
}