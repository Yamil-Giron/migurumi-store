import { Component, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
      this.cdr.detectChanges();
      return;
    }
    if (this.contrasena.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      this.cdr.detectChanges();
      return;
    }
    if (this.contrasena !== this.confirmar) {
      this.error = 'Las contraseñas no coinciden';
      this.cdr.detectChanges();
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
          this.cdr.detectChanges();  // ← Forzar render del mensaje verde
          setTimeout(() => this.router.navigate(['/']), 5000);
        },
        error: (err) => {
          this.cargando = false;
          this.error = err.error?.error || 'Error al registrarse';
          this.cdr.detectChanges();  // ← Forzar render del mensaje rojo
        },
      });
  }
}