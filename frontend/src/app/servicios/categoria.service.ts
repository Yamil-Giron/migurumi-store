import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Categoria, RespuestaCategorias } from './categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:3000/api/categorias';

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http
      .get<RespuestaCategorias>(this.apiUrl)
      .pipe(map(res => res.categorias));
  }

  getCategoriaPorId(id: string): Observable<Categoria> {
    return this.http
      .get<{ categoria: Categoria }>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.categoria));
  }
}