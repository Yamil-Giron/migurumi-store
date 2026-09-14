import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

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
      return;
    }

    this.cargando = true;

    this.auth
      .login({ email: this.email, contraseña: this.contrasena })
      .subscribe({
        next: (res) => {
          this.cargando = false;
          this.exito = `¡Bienvenido, ${res.usuario.nombre}!`;
          setTimeout(() => this.router.navigate(['/']), 1000);
        },
        error: (err: HttpErrorResponse) => {
          this.cargando = false;

          if (err.status === 0) {
            this.error = 'No se puede conectar con el servidor.';
          } else if (err.status === 400) {
            this.error = err.error?.error || 'Credenciales inválidas';
          } else {
            this.error = err.error?.error || `Error ${err.status}`;
          }
        },
      });
  }
}