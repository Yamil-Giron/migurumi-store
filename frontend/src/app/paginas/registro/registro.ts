import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
})
export class Registro {
  private auth = inject(AuthService);
  private router = inject(Router);

  nombre = '';
  email = '';
  contrasena = '';
  confirmar = '';
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  onSubmit(): void {
    this.error = null;
    this.exito = null;

    if (!this.nombre || !this.email || !this.contrasena) {
      this.error = 'Todos los campos son requeridos';
      return;
    }
    if (this.contrasena.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    if (this.contrasena !== this.confirmar) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;

    this.auth
      .registro({
        nombre: this.nombre,
        email: this.email,
        contraseña: this.contrasena,
        rol: 'cliente',
      })
      .subscribe({
        next: (res) => {
          this.cargando = false;
          this.exito = `¡Cuenta creada! Bienvenido, ${res.usuario.nombre}`;
          console.log('✅ Registro exitoso:', res);
          setTimeout(() => this.router.navigate(['/']), 1200);
        },
        error: (err) => {
          this.cargando = false;
          console.error('❌ Error registro:', err);
          this.error = err.error?.error || 'Error al registrarse';
        },
      });
  }
}