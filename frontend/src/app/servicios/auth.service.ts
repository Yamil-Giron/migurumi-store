import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'cliente' | 'administrador';
}

export interface RespuestaAuth {
  mensaje: string;
  token: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:3000/api/auth';

  private usuarioSubject: BehaviorSubject<Usuario | null>;
  usuario$: Observable<Usuario | null>;

  private tokenKey = 'migurumi_token';
  private userKey = 'migurumi_usuario';

  constructor() {
    // Solo intentar leer localStorage si estamos en el navegador
    const usuarioInicial = this.esNavegador() ? this.leerUsuario() : null;
    this.usuarioSubject = new BehaviorSubject<Usuario | null>(usuarioInicial);
    this.usuario$ = this.usuarioSubject.asObservable();
  }

  registro(datos: {
    nombre: string;
    email: string;
    contraseña: string;
    rol?: string;
  }): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.apiUrl}/registro`, datos)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  login(credenciales: { email: string; contraseña: string }): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.apiUrl}/login`, credenciales)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  logout(): void {
    if (this.esNavegador()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.usuarioSubject.next(null);
  }

  getToken(): string | null {
    if (!this.esNavegador()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  esAdmin(): boolean {
    return this.usuarioSubject.value?.rol === 'administrador';
  }

  private guardarSesion(res: RespuestaAuth): void {
    if (this.esNavegador()) {
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem(this.userKey, JSON.stringify(res.usuario));
    }
    this.usuarioSubject.next(res.usuario);
  }

  private leerUsuario(): Usuario | null {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private esNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}