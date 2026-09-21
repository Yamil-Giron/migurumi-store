import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Categoria, RespuestaCategorias } from './categoria.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categorias`;

  getCategorias(): Observable<Categoria[]> {
    return this.http
      .get<RespuestaCategorias>(this.apiUrl)
      .pipe(
        map((res) => (Array.isArray(res?.categorias) ? res.categorias : []))
      );
  }

  getCategoriaPorId(id: string): Observable<Categoria> {
    return this.http
      .get<{ categoria: Categoria }>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.categoria));
  }

  crearCategoria(categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http
      .post<{ categoria: Categoria }>(this.apiUrl, categoria)
      .pipe(map((res) => res.categoria));
  }

  actualizarCategoria(id: string, categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http
      .put<{ categoria: Categoria }>(`${this.apiUrl}/${id}`, categoria)
      .pipe(map((res) => res.categoria));
  }

  eliminarCategoria(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}