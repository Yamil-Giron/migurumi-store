import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Envio } from './envio.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/envios`;

  crearEnvio(pedidoId: string, transportista: string, numeroSeguimiento: string): Observable<Envio> {
    return this.http
      .post<{ mensaje: string; envio: Envio }>(this.apiUrl, { pedidoId, transportista, numeroSeguimiento })
      .pipe(map((res) => res.envio));
  }

  actualizarEstado(id: string, estado: string, comentario?: string): Observable<Envio> {
    return this.http
      .put<{ mensaje: string; envio: Envio }>(`${this.apiUrl}/${id}/estado`, { estado, comentario })
      .pipe(map((res) => res.envio));
  }

  getTodos(): Observable<Envio[]> {
    return this.http.get<{ envios: Envio[] }>(this.apiUrl).pipe(map((res) => res.envios));
  }

  getMisEnvios(): Observable<Envio[]> {
    return this.http.get<{ envios: Envio[] }>(`${this.apiUrl}/mis`).pipe(map((res) => res.envios));
  }
}