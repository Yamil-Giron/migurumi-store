import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, Usuario } from '../../servicios/auth.service';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './perfil-usuario.html',
  styleUrls: ['./perfil-usuario.css'],
})
export class PerfilUsuario implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  usuario = signal<Usuario | null>(null);
  editando = signal(false);
  guardado = signal(false);
  mostrarConfirmarLogout = signal(false);
  copiadoId = signal(false);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    telefono: [''],
    fotoPerfil: [''],
    calle: [''],
    ciudad: [''],
    region: [''],
    codigoPostal: [''],
  });

  ngOnInit(): void {
    this.auth.usuario$.subscribe((u) => {
      this.usuario.set(u);
      if (u) {
        this.form.patchValue({
          nombre: u.nombre,
          telefono: u.telefono ?? '',
          fotoPerfil: u.fotoPerfil ?? '',
          calle: u.direccion?.calle ?? '',
          ciudad: u.direccion?.ciudad ?? '',
          region: u.direccion?.region ?? '',
          codigoPostal: u.direccion?.codigoPostal ?? '',
        });
      }
    });
  }
  getAvatarUrl(nombre: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=f5a1b8&color=fff&size=200`;
  }

  activarEdicion(): void {
    this.editando.set(true);
  }

  cancelarEdicion(): void {
    const u = this.usuario();
    if (u) {
      this.form.patchValue({
        nombre: u.nombre,
        telefono: u.telefono ?? '',
        fotoPerfil: u.fotoPerfil ?? '',
        calle: u.direccion?.calle ?? '',
        ciudad: u.direccion?.ciudad ?? '',
        region: u.direccion?.region ?? '',
        codigoPostal: u.direccion?.codigoPostal ?? '',
      });
    }
    this.editando.set(false);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const u = this.usuario();
    if (!u) return;

    const v = this.form.value;

    const usuarioActualizado: Usuario = {
      ...u,
      nombre: v.nombre.trim(),
      telefono: v.telefono?.trim() || undefined,
      fotoPerfil: v.fotoPerfil?.trim() || null,
      direccion: {
        calle: v.calle?.trim() || undefined,
        ciudad: v.ciudad?.trim() || undefined,
        region: v.region?.trim() || undefined,
        codigoPostal: v.codigoPostal?.trim() || undefined,
        pais: u.direccion?.pais ?? 'Chile',
      },
    };

    // ⚠️ Guardado local por ahora. Falta endpoint en backend.
    this.auth.actualizarUsuarioLocal(usuarioActualizado);

    this.editando.set(false);
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 2500);
  }

  copiarId(): void {
    const id = this.usuario()?.id;
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      this.copiadoId.set(true);
      setTimeout(() => this.copiadoId.set(false), 1500);
    });
  }

  // ===== Logout =====
  abrirConfirmarLogout(): void {
    this.mostrarConfirmarLogout.set(true);
  }

  cancelarLogout(): void {
    this.mostrarConfirmarLogout.set(false);
  }

  confirmarLogout(): void {
    this.mostrarConfirmarLogout.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}