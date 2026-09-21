export interface Direccion {
  calle?: string;
  ciudad?: string;
  region?: string;
  codigoPostal?: string;
  pais?: string;
}

export interface ClientePedido {
  nombre: string;
  email: string;
  telefono?: string;
}

export interface Cotizacion {
  precio?: number;
  tiempoEstimado?: string;
  notas?: string;
  fechaCotizacion?: string;
}

export interface EnvioPedido {
  tipo: 'cotizar' | 'retiro' | 'domicilio';
  direccion?: Direccion;
  costo?: number;
}

export type EstadoPedido =
  | 'pendiente'
  | 'cotizado'
  | 'aprobado'
  | 'en_produccion'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export interface PedidoPersonalizado {
  _id?: string;
  numeroPedido?: string;
  cliente: ClientePedido;
  descripcion: string;
  colores: string[];
  tamanos: string[];
  cantidad: number;
  imagenesReferencia: string[];
  presupuestoCliente?: number;
  envio: EnvioPedido;
  estado: EstadoPedido;
  cotizacion?: Cotizacion;
  notasAdmin?: string;
  usuarioId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RespuestaPedidos {
  total: number;
  pedidos: PedidoPersonalizado[];
}