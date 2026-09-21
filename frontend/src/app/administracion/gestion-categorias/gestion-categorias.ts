import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CategoriaService } from '../../servicios/categoria.service';
import { Categoria } from '../../servicios/categoria.model';
import { RouterModule } from '@angular/router';
import { AdminNav } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-gestion-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminNav],
  templateUrl: './gestion-categorias.html',
  styleUrls: ['./gestion-categorias.css'],
})
export class GestionCategorias implements OnInit {
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);

  categorias = signal<Categoria[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  error = signal('');
  mostrarFormulario = signal(false);
  editandoId = signal<string | null>(null);
  categoriaAEliminar = signal<Categoria | null>(null);   // ← NUEVO

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: [''],
    orden: [0, [Validators.min(0)]],
    activa: [true],
  });

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando.set(true);
    this.error.set('');
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        const ordenadas = [...data].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        this.categorias.set(ordenadas);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
        this.error.set('No se pudieron cargar las categorías.');
        this.cargando.set(false);
      },
    });
  }

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.form.reset({
      nombre: '',
      descripcion: '',
      orden: this.categorias().length + 1,
      activa: true,
    });
    this.mostrarFormulario.set(true);
  }

  abrirEditar(categoria: Categoria): void {
    this.editandoId.set(categoria._id ?? null);
    this.form.reset({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
      orden: categoria.orden ?? 0,
      activa: categoria.activa ?? true,
    });
    this.mostrarFormulario.set(true);
  }

  cancelar(): void {
    this.mostrarFormulario.set(false);
    this.editandoId.set(null);
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    const v = this.form.value;
    const payload: Partial<Categoria> = {
      nombre: v.nombre.trim(),
      descripcion: v.descripcion || undefined,
      orden: Number(v.orden) || 0,
      activa: v.activa,
    };

    const id = this.editandoId();
    const operacion = id
      ? this.categoriaService.actualizarCategoria(id, payload)
      : this.categoriaService.crearCategoria(payload);

    operacion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.editandoId.set(null);
        this.cargarCategorias();
      },
      error: (err) => {
        console.error('Error al guardar categoría', err);
        this.error.set(
          err?.error?.error ?? err?.error?.mensaje ?? 'No se pudo guardar la categoría.'
        );
        this.guardando.set(false);
      },
    });
  }

  // ============ ELIMINAR ============

  abrirConfirmacionEliminar(categoria: Categoria): void {
    this.categoriaAEliminar.set(categoria);
  }

  cancelarEliminar(): void {
    this.categoriaAEliminar.set(null);
  }

  confirmarEliminar(): void {
    const categoria = this.categoriaAEliminar();
    if (!categoria?._id) return;

    this.categoriaService.eliminarCategoria(categoria._id).subscribe({
      next: () => {
        this.categoriaAEliminar.set(null);
        this.cargarCategorias();
      },
      error: (err) => {
        console.error('Error al eliminar categoría', err);
        this.error.set(
          err?.error?.error ?? err?.error?.mensaje ?? 'No se pudo eliminar la categoría.'
        );
        this.categoriaAEliminar.set(null);
      },
    });
  }
}