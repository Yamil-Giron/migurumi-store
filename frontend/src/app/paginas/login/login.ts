import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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

    this.auth.login({ email: this.email, contraseña: this.contrasena }).subscribe({
      next: (res) => {
        this.cargando = false;
        this.exito = `¡Bienvenido, ${res.usuario.nombre}!`;
        this.cdr.detectChanges();

        const destino = this.auth.esAdmin() ? '/admin/gestion-productos' : '/';
        setTimeout(() => this.router.navigate([destino]), 1200);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.error || err?.error?.mensaje || 'Credenciales inválidas';
        this.cdr.detectChanges();
      },
    });
  }
}