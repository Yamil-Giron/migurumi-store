import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Producto, RespuestaProductos } from './producto.model';

// Re-export para compatibilidad con imports existentes
export type { Producto } from './producto.model';
@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:3000/api/productos';

  constructor(private http: HttpClient) {}

  // Devuelve directamente el array (desenvuelve { total, productos })
  getProductos(filtros?: {
    categoria?: string;
    buscar?: string;
    destacado?: boolean;
    orden?: string;
  }): Observable<Producto[]> {
    let params = new HttpParams();
    if (filtros?.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros?.buscar) params = params.set('buscar', filtros.buscar);
    if (filtros?.destacado !== undefined) params = params.set('destacado', String(filtros.destacado));
    if (filtros?.orden) params = params.set('orden', filtros.orden);

    return this.http
      .get<RespuestaProductos>(this.apiUrl, { params })
      .pipe(map(res => res.productos));
  }

  getProductoPorId(id: string): Observable<Producto> {
    return this.http
      .get<{ producto: Producto }>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.producto));
  }

  crearProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http
      .post<{ producto: Producto }>(this.apiUrl, producto)
      .pipe(map(res => res.producto));
  }

  actualizarProducto(id: string, producto: Partial<Producto>): Observable<Producto> {
    return this.http
      .put<{ producto: Producto }>(`${this.apiUrl}/${id}`, producto)
      .pipe(map(res => res.producto));
  }

  eliminarProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}