export interface HistorialSeguimiento {
  estado: string;
  fecha: string;
  comentario?: string;
}

export interface Envio {
  _id?: string;
  pedidoId: string;
  usuarioId?: string;
  transportista: string;
  numeroSeguimiento: string;
  estado: 'preparando' | 'despachado' | 'en_transito' | 'entregado';
  fechaDespacho?: string;
  fechaEntrega?: string;
  historialSeguimiento?: HistorialSeguimiento[];
}