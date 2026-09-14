import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  contrasena = '';
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  onSubmit(): void {
    this.error = null;
    this.exito = null;

    if (!this.email || !this.contrasena) {
      this.error = 'Email y contraseña son requeridos';
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;

    this.http
      .post<any>('http://localhost:3000/api/auth/login', {
        email: this.email,
        contraseña: this.contrasena,
      })
      .subscribe({
        next: (res) => {
          this.cargando = false;
          this.exito = `¡Bienvenido, ${res.usuario.nombre}!`;
          localStorage.setItem('migurumi_token', res.token);
          localStorage.setItem('migurumi_usuario', JSON.stringify(res.usuario));
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/']), 1000);
        },
        error: (err) => {
          this.cargando = false;
          this.error = err?.error?.error || 'Credenciales inválidas';
          this.cdr.detectChanges();
        },
      });
  }
}