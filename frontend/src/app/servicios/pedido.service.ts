import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Pedido } from './pedido.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pedidos`;

  crearPedido(pedido: Pedido): Observable<Pedido> {
    return this.http
      .post<{ mensaje: string; pedido: Pedido }>(this.apiUrl, pedido)
      .pipe(map((res) => res.pedido));
  }

  getMisPedidos(): Observable<Pedido[]> {
    return this.http
      .get<{ pedidos: Pedido[] }>(`${this.apiUrl}/mios`)
      .pipe(map((res) => res.pedidos));
  }
}