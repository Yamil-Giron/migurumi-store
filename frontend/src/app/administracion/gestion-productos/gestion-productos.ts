import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { CategoriaService } from '../../servicios/categoria.service';
import { Producto } from '../../servicios/producto.model';
import { Categoria } from '../../servicios/categoria.model';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.css',
})
export class GestionProductos implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  cargando = true;
  error = '';

  mostrarFormulario = false;
  editandoId: string | null = null;
  guardando = false;

  form = this.fb.group({
    nombre: ['', Validators.required],
    categoriaId: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    descripcion: [''],
    imagenUrl: [''],
    destacado: [false],
    activo: [true],
  });

  ngOnInit(): void {
    this.cargarProductos();
    this.categoriaService.getCategorias().subscribe((cats) => (this.categorias = cats));
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos.';
        this.cargando = false;
      },
    });
  }

  nombreCategoria(producto: Producto): string {
    const c = producto.categoriaId;
    return typeof c === 'object' && c !== null ? c.nombre : '';
  }

  formatearPrecio(valor: number): string {
    return '$' + valor.toLocaleString('es-CL');
  }

  abrirNuevo(): void {
    this.editandoId = null;
    this.form.reset({ precio: 0, stock: 0, destacado: false, activo: true });
    this.mostrarFormulario = true;
  }

  abrirEditar(producto: Producto): void {
    this.editandoId = producto._id!;
    const categoriaId =
      typeof producto.categoriaId === 'object' ? producto.categoriaId._id : producto.categoriaId;

    this.form.reset({
      nombre: producto.nombre,
      categoriaId,
      precio: producto.precio,
      stock: producto.stock,
      descripcion: producto.descripcion || '',
      imagenUrl: producto.imagenesUrl?.[0] || '',
      destacado: producto.destacado || false,
      activo: producto.activo ?? true,
    });
    this.mostrarFormulario = true;
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const payload: Partial<Producto> = {
      nombre: valores.nombre!,
      categoriaId: valores.categoriaId!,
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      descripcion: valores.descripcion || '',
      imagenesUrl: valores.imagenUrl ? [valores.imagenUrl] : [],
      destacado: !!valores.destacado,
      activo: !!valores.activo,
    };

    this.guardando = true;

    const peticion = this.editandoId
      ? this.productoService.actualizarProducto(this.editandoId, payload)
      : this.productoService.crearProducto(payload);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.cargarProductos();
      },
      error: () => {
        this.guardando = false;
        this.error = 'No se pudo guardar el producto.';
      },
    });
  }

  eliminar(producto: Producto): void {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

    this.productoService.eliminarProducto(producto._id!).subscribe({
      next: () => this.cargarProductos(),
      error: () => (this.error = 'No se pudo eliminar el producto.'),
    });
  }
}