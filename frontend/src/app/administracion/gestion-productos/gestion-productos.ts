import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { CategoriaService } from '../../servicios/categoria.service';
import { Producto } from '../../servicios/producto.model';
import { Categoria } from '../../servicios/categoria.model';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.css',
})
export class GestionProductos implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  cargando = false;
  guardando = false;
  error = '';
  mostrarFormulario = false;
  editandoId: string | null = null;

  // OJO: los nombres 'categoria' e 'imagen' coinciden con tu HTML actual.
  // El mapeo a 'categoriaId' e 'imagenesUrl' se hace en guardar().
  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    categoria: ['', Validators.required],
    imagen: [''],
    stock: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.error = 'No se pudieron cargar los productos.';
        this.cargando = false;
      },
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => console.error('Error al cargar categorías', err),
    });
  }

  abrirNuevo(): void {
    this.editandoId = null;
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      imagen: '',
      stock: 0,
    });
    this.mostrarFormulario = true;
  }

  abrirEditar(producto: Producto): void {
    this.editandoId = producto._id ?? null;

    const categoriaId =
      typeof producto.categoriaId === 'object'
        ? producto.categoriaId._id
        : producto.categoriaId;

    this.form.reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio: producto.precio,
      categoria: categoriaId,
      imagen: producto.imagenesUrl?.[0] ?? '',
      stock: producto.stock ?? 0,
    });
    this.mostrarFormulario = true;
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.error = '';

    const v = this.form.value;

    // Mapeo del form → campos reales del modelo Producto
    const payload: Partial<Producto> = {
      nombre: v.nombre,
      descripcion: v.descripcion || undefined,
      precio: Number(v.precio),
      stock: Number(v.stock),
      categoriaId: v.categoria,
      imagenesUrl: v.imagen ? [v.imagen] : [],
    };

    const operacion = this.editandoId
      ? this.productoService.actualizarProducto(this.editandoId, payload)
      : this.productoService.crearProducto(payload);

    operacion.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.editandoId = null;
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error al guardar', err);
        this.error = err?.error?.mensaje ?? 'No se pudo guardar el producto.';
        this.guardando = false;
      },
    });
  }

  eliminar(producto: Producto): void {
    if (!producto._id) return;
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return;

    this.productoService.eliminarProducto(producto._id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => {
        console.error('Error al eliminar', err);
        this.error = err?.error?.mensaje ?? 'No se pudo eliminar el producto.';
      },
    });
  }

  nombreCategoria(producto: Producto): string {
    if (!producto.categoriaId) return '—';
    if (typeof producto.categoriaId === 'object') {
      return producto.categoriaId.nombre ?? '—';
    }
    const cat = this.categorias.find((c) => c._id === producto.categoriaId);
    return cat?.nombre ?? '—';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio ?? 0);
  }
}