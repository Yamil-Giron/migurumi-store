import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Categoria, RespuestaCategorias } from './categoria.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;   // ← clave

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http
      .get<RespuestaCategorias>(this.apiUrl)
      .pipe(
        map(res => Array.isArray(res?.categorias) ? res.categorias : [])
      );
  }
}