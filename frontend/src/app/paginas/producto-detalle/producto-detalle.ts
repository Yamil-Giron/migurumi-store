import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductoService } from '../../servicios/producto.service';
import { CarritoService, VarianteSeleccionada } from '../../servicios/carrito.service';
import { Producto, Variante } from '../../servicios/producto.model';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './producto-detalle.html',
  styleUrls: ['./producto-detalle.css'],
})
export class ProductoDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);

  producto = signal<Producto | null>(null);
  cargando = signal(true);
  error = signal('');
  agregado = signal(false);

  colorSeleccionado = signal<string>('');
  medidaSeleccionada = signal<string>('');
  cantidad = signal(1);

  coloresDisponibles = computed(() => {
    const p = this.producto();
    if (!p?.variantes) return [];
    return [...new Set(p.variantes.map((v) => v.color))];
  });

  medidasDisponibles = computed(() => {
    const p = this.producto();
    if (!p?.variantes) return [];
    const color = this.colorSeleccionado();
    if (!color) return [...new Set(p.variantes.map((v) => v.medida))];
    return [
      ...new Set(
        p.variantes.filter((v) => v.color === color).map((v) => v.medida)
      ),
    ];
  });

  varianteActual = computed<Variante | null>(() => {
    const p = this.producto();
    if (!p?.variantes) return null;
    const color = this.colorSeleccionado();
    const medida = this.medidaSeleccionada();
    if (!color || !medida) return null;
    return (
      p.variantes.find((v) => v.color === color && v.medida === medida) ?? null
    );
  });

  precioFinal = computed(() => {
    const p = this.producto();
    if (!p) return 0;
    return p.precio + (this.varianteActual()?.precioExtra ?? 0);
  });

  stockDisponible = computed(() => {
    const p = this.producto();
    if (!p) return 0;
    const variante = this.varianteActual();
    if (variante) return variante.stock;
    return p.stock ?? 0;
  });

  puedeAgregar = computed(() => {
    const p = this.producto();
    if (!p) return false;
    if (!p.variantes || p.variantes.length === 0) return (p.stock ?? 0) > 0;
    if (!this.colorSeleccionado() || !this.medidaSeleccionada()) return false;
    return (this.varianteActual()?.stock ?? 0) > 0;
  });

  sinStock = computed(() => {
    const p = this.producto();
    if (!p?.variantes?.length) return false;
    if (!this.colorSeleccionado() || !this.medidaSeleccionada()) return false;
    return (this.varianteActual()?.stock ?? 0) === 0;
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.error.set('Producto no encontrado');
      this.cargando.set(false);
      return;
    }
    this.cargarProducto(slug);
  }

  private cargarProducto(slug: string): void {
    this.cargando.set(true);
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        const encontrado = productos.find((p) => p.slug === slug);
        if (!encontrado) {
          this.error.set('Producto no encontrado');
          this.cargando.set(false);
          return;
        }
        this.producto.set(encontrado);

        if (encontrado.variantes && encontrado.variantes.length > 0) {
          const conStock =
            encontrado.variantes.find((v) => v.stock > 0) ??
            encontrado.variantes[0];
          this.colorSeleccionado.set(conStock.color);
          this.medidaSeleccionada.set(conStock.medida);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.error.set('Error al cargar el producto');
        this.cargando.set(false);
      },
    });
  }

  seleccionarColor(color: string): void {
    this.colorSeleccionado.set(color);
    const medidas = this.medidasDisponibles();
    if (!medidas.includes(this.medidaSeleccionada())) {
      this.medidaSeleccionada.set(medidas[0] ?? '');
    }
    this.cantidad.set(1);
  }

  seleccionarMedida(medida: string): void {
    this.medidaSeleccionada.set(medida);
    this.cantidad.set(1);
  }

  medidaTieneStock(medida: string): boolean {
    const p = this.producto();
    if (!p?.variantes) return false;
    const v = p.variantes.find(
      (x) => x.color === this.colorSeleccionado() && x.medida === medida
    );
    return (v?.stock ?? 0) > 0;
  }

  incrementarCantidad(): void {
    if (this.cantidad() < this.stockDisponible()) {
      this.cantidad.set(this.cantidad() + 1);
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad() > 1) this.cantidad.set(this.cantidad() - 1);
  }

  agregarAlCarrito(): void {
    const p = this.producto();
    if (!p || !this.puedeAgregar()) return;

    let variante: VarianteSeleccionada | undefined;
    const v = this.varianteActual();
    if (v && v._id) {
      variante = {
        varianteId: v._id,
        color: v.color,
        medida: v.medida,
        precioExtra: v.precioExtra ?? 0,
      };
    }

    this.carritoService.agregarProducto(p, this.cantidad(), variante);
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 2000);
  }

  nombreCategoria(producto: Producto): string {
    if (!producto.categoriaId) return '—';
    if (typeof producto.categoriaId === 'object') {
      return producto.categoriaId.nombre ?? '—';
    }
    return '—';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio ?? 0);
  }
}