import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  PedidoPersonalizado,
  RespuestaPedidos,
} from './pedido-personalizado.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoPersonalizadoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pedidos-personalizados`;

  // POST público (opcionalmente con token)
  crearPedido(pedido: Partial<PedidoPersonalizado>): Observable<PedidoPersonalizado> {
    return this.http
      .post<{ pedido: PedidoPersonalizado }>(this.apiUrl, pedido)
      .pipe(map((res) => res.pedido));
  }

  // GET admin: todos los pedidos
  getPedidos(filtros?: {
    estado?: string;
    buscar?: string;
  }): Observable<PedidoPersonalizado[]> {
    let params = new URLSearchParams();
    if (filtros?.estado) params.set('estado', filtros.estado);
    if (filtros?.buscar) params.set('buscar', filtros.buscar);

    const query = params.toString();
    const url = query ? `${this.apiUrl}?${query}` : this.apiUrl;

    return this.http
      .get<RespuestaPedidos>(url)
      .pipe(map((res) => (Array.isArray(res?.pedidos) ? res.pedidos : [])));
  }

  // GET cliente: sus propios pedidos
  getMisPedidos(): Observable<PedidoPersonalizado[]> {
    return this.http
      .get<RespuestaPedidos>(`${this.apiUrl}/mios`)
      .pipe(map((res) => (Array.isArray(res?.pedidos) ? res.pedidos : [])));
  }

  // GET admin: un pedido
  getPedidoPorId(id: string): Observable<PedidoPersonalizado> {
    return this.http
      .get<{ pedido: PedidoPersonalizado }>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.pedido));
  }

  // PUT admin
  actualizarPedido(
    id: string,
    datos: Partial<PedidoPersonalizado>
  ): Observable<PedidoPersonalizado> {
    return this.http
      .put<{ pedido: PedidoPersonalizado }>(`${this.apiUrl}/${id}`, datos)
      .pipe(map((res) => res.pedido));
  }

  // DELETE admin
  eliminarPedido(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}