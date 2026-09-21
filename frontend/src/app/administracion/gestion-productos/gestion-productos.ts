import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { CategoriaService } from '../../servicios/categoria.service';
import { Producto, Variante } from '../../servicios/producto.model';
import { Categoria } from '../../servicios/categoria.model';
import { RouterModule } from '@angular/router';
import { AdminNav } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminNav],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.css',
})
export class GestionProductos implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);
  private cloudName = 'naybrja2';
  private uploadPreset = 'migurumi-store';

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  error = signal('');
  mostrarFormulario = signal(false);
  editandoId = signal<string | null>(null);
  productoAEliminar = signal<Producto | null>(null);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    categoriaId: ['', Validators.required],
    imagenUrl: [''],
    stock: [0, [Validators.min(0)]],
    activo: [true],
    destacado: [false],
    variantes: this.fb.array([]),   // ← NUEVO
  });

  // Getter cómodo para el FormArray de variantes
  get variantesArray(): FormArray {
    return this.form.get('variantes') as FormArray;
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  // ============ CARGA ============

  cargarProductos(): void {
    this.cargando.set(true);
    this.error.set('');
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.error.set('No se pudieron cargar los productos.');
        this.cargando.set(false);
      },
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => this.categorias.set(data),
      error: (err) => console.error('Error al cargar categorías', err),
    });
  }

  // ============ VARIANTES ============

  crearGrupoVariante(v?: Partial<Variante>): FormGroup {
    return this.fb.group({
      color: [v?.color ?? '', Validators.required],
      medida: [v?.medida ?? '', Validators.required],
      stock: [v?.stock ?? 0, [Validators.required, Validators.min(0)]],
      precioExtra: [v?.precioExtra ?? 0, [Validators.min(0)]],
    });
  }

  agregarVariante(): void {
    this.variantesArray.push(this.crearGrupoVariante());
  }

  eliminarVariante(index: number): void {
    this.variantesArray.removeAt(index);
  }

  private cargarVariantesEnForm(variantes: Variante[] = []): void {
    this.variantesArray.clear();
    variantes.forEach((v) => this.variantesArray.push(this.crearGrupoVariante(v)));
  }

  // ============ MODAL ============

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoriaId: '',
      imagenUrl: '',
      stock: 0,
      activo: true,
      destacado: false,
    });
    this.variantesArray.clear();
    this.mostrarFormulario.set(true);
  }

  abrirEditar(producto: Producto): void {
    this.editandoId.set(producto._id ?? null);

    const categoriaId =
      typeof producto.categoriaId === 'object'
        ? producto.categoriaId._id
        : producto.categoriaId;

    this.form.reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio: producto.precio,
      categoriaId: categoriaId,
      imagenUrl: producto.imagenesUrl?.[0] ?? '',
      stock: producto.stock ?? 0,
      activo: producto.activo ?? true,
      destacado: producto.destacado ?? false,
    });

    this.cargarVariantesEnForm(producto.variantes ?? []);
    this.mostrarFormulario.set(true);
  }

  cancelar(): void {
    this.mostrarFormulario.set(false);
    this.editandoId.set(null);
    this.form.reset();
    this.variantesArray.clear();
  }

  // ============ GUARDAR ============

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    const v = this.form.value;

    // Normalizar variantes
    const variantes: Variante[] = (v.variantes ?? []).map((vari: any) => ({
      color: (vari.color ?? '').trim(),
      medida: (vari.medida ?? '').trim(),
      stock: Number(vari.stock) || 0,
      precioExtra: Number(vari.precioExtra) || 0,
    }));

    // Validar combinaciones duplicadas
    const combinaciones = variantes.map(
      (x) => `${x.color.toLowerCase()}|${x.medida.toLowerCase()}`
    );
    const hayDuplicados = combinaciones.some(
      (c, i) => combinaciones.indexOf(c) !== i
    );
    if (hayDuplicados) {
      this.error.set('Hay variantes duplicadas (mismo color y medida).');
      this.guardando.set(false);
      return;
    }

    // El stock total del producto es la suma de los stocks de las variantes.
    // Si no hay variantes, se usa el stock manual del formulario.
    const stockTotal =
      variantes.length > 0
        ? variantes.reduce((acc, x) => acc + (x.stock ?? 0), 0)
        : Number(v.stock) || 0;

    const payload: Partial<Producto> = {
      nombre: v.nombre,
      descripcion: v.descripcion || undefined,
      precio: Number(v.precio),
      stock: stockTotal,
      categoriaId: v.categoriaId,
      imagenesUrl: v.imagenUrl ? [v.imagenUrl] : [],
      activo: v.activo,
      destacado: v.destacado,
      variantes,   // ← NUEVO
    };

    const id = this.editandoId();
    const operacion = id
      ? this.productoService.actualizarProducto(id, payload)
      : this.productoService.crearProducto(payload);

    operacion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.editandoId.set(null);
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error al guardar', err);
        this.error.set(
          err?.error?.mensaje ?? err?.error?.error ?? 'No se pudo guardar el producto.'
        );
        this.guardando.set(false);
      },
    });
  }

// ============ ELIMINAR ============

abrirConfirmacionEliminar(producto: Producto): void {
  this.productoAEliminar.set(producto);
}

cancelarEliminar(): void {
  this.productoAEliminar.set(null);
}

confirmarEliminar(): void {
  const producto = this.productoAEliminar();
  if (!producto?._id) return;

  this.productoService.eliminarProducto(producto._id).subscribe({
    next: () => {
      this.productoAEliminar.set(null);
      this.cargarProductos();
    },
    error: (err) => {
      console.error('Error al eliminar', err);
      this.error.set(
        err?.error?.mensaje ?? err?.error?.error ?? 'No se pudo eliminar el producto.'
      );
      this.productoAEliminar.set(null);
    },
  });
}

  // ============ HELPERS ============

  nombreCategoria(producto: Producto): string {
    if (!producto.categoriaId) return '—';
    if (typeof producto.categoriaId === 'object') {
      return producto.categoriaId.nombre ?? '—';
    }
    const cat = this.categorias().find((c) => c._id === producto.categoriaId);
    return cat?.nombre ?? '—';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio ?? 0);
  }

  // Para mostrar un resumen de variantes en la tabla
  resumenVariantes(producto: Producto): string {
    if (!producto.variantes || producto.variantes.length === 0) {
      return '—';
    }
    return `${producto.variantes.length} variante(s)`;
  }

  subirImagen(): void {
  const widget = (window as any).cloudinary.createUploadWidget(
    {
      cloudName: this.cloudName,
      uploadPreset: this.uploadPreset,
      sources: ['local', 'url', 'camera'],
      multiple: false,
      maxFileSize: 5000000, // 5MB
      folder: 'productos', // Opcional, si lo configuraste en el preset
    },
    (error: any, result: any) => {
      if (!error && result && result.event === 'success') {
        // Al subir con éxito, actualiza el campo 'imagenUrl' del formulario
        this.form.patchValue({ imagenUrl: result.info.secure_url });
        // Opcional: forzar la detección de cambios si es necesario
      }
    }
  );
  widget.open();
}
}