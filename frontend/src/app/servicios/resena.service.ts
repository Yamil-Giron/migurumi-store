import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Resena } from './resena.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/resenas`;

  crearResena(resena: Partial<Resena>): Observable<Resena> {
    return this.http
      .post<{ mensaje: string; resena: Resena }>(this.apiUrl, resena)
      .pipe(map((res) => res.resena));
  }

  getPorProducto(productoId: string): Observable<Resena[]> {
    return this.http
      .get<{ resenas: Resena[] }>(`${this.apiUrl}/producto/${productoId}`)
      .pipe(map((res) => res.resenas));
  }
}